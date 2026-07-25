import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { getPrisma } from '../config/database';
import { getRedis, isRedisAvailable } from '../config/redis';
import { UserRepository } from '../repositories';
import { JwtPayload } from '../types';
import { UnauthorizedError, BadRequestError, ConflictError, NotFoundError, TooManyRequestsError } from '../utils/errors';
import { logger } from '../config/logger';
import { addJob } from '../workers/queue';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async register(data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) {
    const existing = await this.userRepo.findByEmail(data.email.toLowerCase());
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const rawEmailToken = crypto.randomBytes(32).toString('hex');
    const hashedEmailToken = this.hashToken(rawEmailToken);

    const user = await this.userRepo.create({
      email: data.email.toLowerCase(),
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      emailToken: hashedEmailToken,
    });

    await this.invalidateLockout(data.email.toLowerCase());

    await addJob('email-verification', {
      userId: user.id,
      email: user.email,
      token: rawEmailToken,
      firstName: user.firstName,
    });

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.saveRefreshToken(user.id, tokens.refreshToken);

    logger.info({ userId: user.id }, 'User registered successfully');

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase();

    await this.checkLockout(normalizedEmail);

    const user = await this.userRepo.findByEmail(normalizedEmail);
    if (!user || !user.isActive || user.deletedAt) {
      await this.recordFailedAttempt(normalizedEmail);
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await this.recordFailedAttempt(normalizedEmail);
      logger.warn({ email: normalizedEmail }, 'Failed login attempt: invalid password');
      throw new UnauthorizedError('Invalid email or password');
    }

    await this.invalidateLockout(normalizedEmail);

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.saveRefreshToken(user.id, tokens.refreshToken);
    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    logger.info({ userId: user.id }, 'User logged in successfully');

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const prisma = getPrisma();

    const storedToken = await prisma.$transaction(async (tx) => {
      const token = await tx.refreshToken.findFirst({
        where: { token: refreshToken, isRevoked: false, expiresAt: { gt: new Date() } },
      });
      if (!token) return null;
      await tx.refreshToken.update({ where: { id: token.id }, data: { isRevoked: true } });
      return token;
    });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await this.userRepo.findById(storedToken.userId);
    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedError('User not found');
    }

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const storedToken = await this.userRepo.findRefreshToken(refreshToken);
      if (storedToken) {
        await this.userRepo.revokeRefreshToken(storedToken.id);
      }
    } else {
      await this.userRepo.revokeAllUserRefreshTokens(userId);
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findByEmail(email.toLowerCase());
    if (!user) {
      logger.info({ email: '[REDACTED]' }, 'Password reset requested for non-existent email');
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const resetTokenExp = new Date(Date.now() + 30 * 60 * 1000);

    await this.userRepo.update(user.id, {
      resetToken: hashedToken,
      resetTokenExp,
    });

    logger.info({ userId: user.id }, 'Password reset token generated');

    await addJob('password-reset', {
      userId: user.id,
      email: user.email,
      token: rawToken,
      firstName: user.firstName,
    });
  }

  async resetPassword(token: string, password: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const prisma = getPrisma();

    const userWithToken = await prisma.user.findFirst({
      where: { resetToken: hashedToken, resetTokenExp: { gte: new Date() } },
    });

    if (!userWithToken) {
      logger.warn({ token: token.substring(0, 8) + '...' }, 'Invalid or expired reset token attempt');
      throw new BadRequestError('Invalid or expired reset link. Please request a new password reset.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await this.userRepo.update(userWithToken.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExp: null,
      passwordChangedAt: new Date(),
    });

    logger.info({ userId: userWithToken.id }, 'Password reset successful');
  }

  async verifyEmail(token: string) {
    const hashedToken = this.hashToken(token);
    const prisma = getPrisma();
    const user = await prisma.user.findFirst({ where: { emailToken: hashedToken } });
    if (!user) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    await this.userRepo.update(user.id, { isEmailVerified: true, emailToken: null });
    logger.info({ userId: user.id }, 'Email verified successfully');
  }

  async resendVerification(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User');
    if (user.isEmailVerified) throw new BadRequestError('Email already verified');

    const rawEmailToken = crypto.randomBytes(32).toString('hex');
    const hashedEmailToken = this.hashToken(rawEmailToken);
    await this.userRepo.update(user.id, { emailToken: hashedEmailToken });

    await addJob('email-verification', {
      userId: user.id,
      email: user.email,
      token: rawEmailToken,
      firstName: user.firstName,
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.userRepo.update(userId, { password: hashedPassword, passwordChangedAt: new Date() });
    await this.userRepo.revokeAllUserRefreshTokens(userId);
    await this.invalidateLockout(user.email);

    logger.info({ userId }, 'Password changed successfully');
  }

  private async checkLockout(email: string): Promise<void> {
    if (!isRedisAvailable()) return;

    const redis = getRedis();
    const lockoutKey = `lockout:${email}`;

    const attempts = await redis.get(lockoutKey);
    if (attempts && parseInt(attempts, 10) >= MAX_LOGIN_ATTEMPTS) {
      const ttl = await redis.ttl(lockoutKey);
      logger.warn({ email: '[REDACTED]', attempts, ttl }, 'Account locked due to too many failed attempts');
      throw new TooManyRequestsError(
        `Account temporarily locked. Try again in ${Math.ceil(ttl / 60)} minutes.`,
      );
    }
  }

  private async recordFailedAttempt(email: string): Promise<void> {
    if (!isRedisAvailable()) return;

    const redis = getRedis();
    const lockoutKey = `lockout:${email}`;

    const attempts = await redis.incr(lockoutKey);
    if (attempts === 1) {
      await redis.expire(lockoutKey, Math.ceil(LOCKOUT_DURATION_MS / 1000));
    }
  }

  private async invalidateLockout(email: string): Promise<void> {
    if (!isRedisAvailable()) return;

    const redis = getRedis();
    await redis.del(`lockout:${email}`);
  }

  private generateTokens(payload: JwtPayload) {
    const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn,
    });

    const refreshToken = uuidv4();

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const msMatch = config.jwt.refreshExpiresIn.match(/^(\d+)([smhd])$/);
    let expiresAt: Date;
    if (msMatch) {
      const num = parseInt(msMatch[1], 10);
      const unit = msMatch[2];
      expiresAt = new Date();
      switch (unit) {
        case 's': expiresAt.setSeconds(expiresAt.getSeconds() + num); break;
        case 'm': expiresAt.setMinutes(expiresAt.getMinutes() + num); break;
        case 'h': expiresAt.setHours(expiresAt.getHours() + num); break;
        case 'd': expiresAt.setDate(expiresAt.getDate() + num); break;
        default: expiresAt.setDate(expiresAt.getDate() + 7);
      }
    } else {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    await this.userRepo.createRefreshToken({
      token,
      user: { connect: { id: userId } },
      expiresAt,
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
