import { Response, NextFunction } from 'express';
import { getPrisma } from '../config/database';
import { AuthRequest } from '../types';

export function auditLog(action: string, entity: string) {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    const originalJson = _res.json.bind(_res);
    _res.json = function (body: unknown) {
      const prisma = getPrisma();
      const entityId = req.params.id as string || (body as any)?.data?.id || undefined;
      prisma.auditLog.create({
        data: {
          userId: req.user?.userId,
          action,
          entity,
          entityId: entityId as string,
          metadata: { method: req.method, path: req.path, statusCode: _res.statusCode } as any,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        },
      }).catch(() => {});
      return originalJson.call(this, body);
    };
    next();
  };
}
