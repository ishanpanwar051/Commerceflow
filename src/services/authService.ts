import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { UserRepository } from '../repositories';
import { JwtPayload } from '../types';
import { UnauthorizedError, BadRequestError, ConflictError, NotFoundError } from '../utils/errors';
import { logger } from '../config/logger';
import { addJob } from '../workers/queue';

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async register(data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const emailToken = uuidv4();

    const user = await this.userRepo.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      emailToken,
    });

    await addJob('email-verification', {
      userId: user.id,
      email: user.email,
      token: emailToken,
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
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

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
    const storedToken = await this.userRepo.findRefreshToken(refreshToken);
    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    await this.userRepo.revokeRefreshToken(storedToken.id);

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
    const user = await this.userRepo.findByEmail(email);
    if (!user) return;

    const resetToken = uuidv4();
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000);

    await this.userRepo.update(user.id, { resetToken, resetTokenExp });

    await addJob('password-reset', {
      userId: user.id,
      email: user.email,
      token: resetToken,
      firstName: user.firstName,
    });
  }

  async resetPassword(token: string, password: string) {
    const user = await this.userRepo.findByEmail(token);
    // We need to find by resetToken
    const { getPrisma } = await import('../config/database');
    const prisma = getPrisma();
    const userWithToken = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExp: { gte: new Date() } },
    });

    if (!userWithToken) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await this.userRepo.update(userWithToken.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExp: null,
    });
  }

  async verifyEmail(token: string) {
    const { getPrisma } = await import('../config/database');
    const prisma = getPrisma();
    const user = await prisma.user.findFirst({ where: { emailToken: token } });
    if (!user) {
      throw new BadRequestError('Invalid verification token');
    }

    await this.userRepo.update(user.id, { isEmailVerified: true, emailToken: null });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.userRepo.update(userId, { password: hashedPassword });
    await this.userRepo.revokeAllUserRefreshTokens(userId);
  }

  private generateTokens(payload: JwtPayload) {
    const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn as any,
    });

    const refreshToken = uuidv4();

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.userRepo.createRefreshToken({
      token,
      user: { connect: { id: userId } },
      expiresAt,
    });
  }
}
