import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload, AuthRequest } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { logger } from '../config/logger';
type Role = 'ADMIN' | 'CUSTOMER' | 'SELLER' | 'DELIVERY_BOY';

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    req.user = decoded;
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
