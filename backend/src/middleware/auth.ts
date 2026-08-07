import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload, AuthRequest, Role } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { logger } from '../config/logger';
import { UserRepository } from '../repositories';

const userRepo = new UserRepository();

export async function authenticate(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;

    // Session versioning: reject tokens issued before the user's last
    // password change or before the account was disabled/deleted.
    const user = await userRepo.findById(decoded.userId);
    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedError('User not found or deactivated');
    }

    if (user.passwordChangedAt) {
      const issuedAt = typeof decoded.iat === 'number' ? decoded.iat * 1000 : 0;
      if (issuedAt && user.passwordChangedAt.getTime() > issuedAt) {
        throw new UnauthorizedError('Session expired. Please sign in again.');
      }
    }

    req.user = { userId: user.id, email: user.email, role: user.role as Role };
    next();
  } catch (error) {
    next(error);
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    req.user = decoded;
  } catch (err) {
    logger.warn({ err }, 'Optional auth: token verification failed');
  }
  next();
}

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
