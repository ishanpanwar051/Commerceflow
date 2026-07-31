import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(result.error);
    }
    // Express 5 made req.query a read-only getter — use defineProperty to override it
    if (target === 'query') {
      const data = result.data;
      Object.defineProperty(req, 'query', { get: () => data, configurable: true });
    } else {
      req[target] = result.data;
    }
    next();
  };
}
