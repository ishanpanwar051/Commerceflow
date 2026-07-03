import { Response, NextFunction } from 'express';
import { getPrisma } from '../config/database';
import { AuthRequest } from '../types';
import { ConflictError } from '../utils/errors';

const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000;

export async function idempotencyMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    next();
    return;
  }

  const key = req.headers['idempotency-key'] as string;
  if (!key) {
    next();
    return;
  }

  req.idempotencyKey = key;

  const prisma = getPrisma();

  const existing = await prisma.idempotencyRecord.findUnique({ where: { key } });

  if (existing) {
    if (existing.response) {
      const response = existing.response as any;
      _res.status(existing.statusCode || 200).json(response);
      return;
    }
    throw new ConflictError('Request with this idempotency key is already processing');
  }

  await prisma.idempotencyRecord.create({
    data: {
      key,
      method: req.method,
      path: req.path,
      expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL),
    },
  });

  next();
}

export async function markIdempotencyComplete(
  key: string,
  statusCode: number,
  response: unknown
): Promise<void> {
  if (!key) return;

  const prisma = getPrisma();
  await prisma.idempotencyRecord.update({
    where: { key },
    data: { statusCode, response: response as any },
  });
}

export async function markIdempotencyOrder(
  key: string,
  orderId: string
): Promise<void> {
  if (!key) return;

  const prisma = getPrisma();
  await prisma.idempotencyRecord.update({
    where: { key },
    data: { orderId },
  });
}
