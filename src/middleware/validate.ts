import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(result.error);
    }
    if (target === 'query') {
      Object.assign(req.query, result.data);
    } else if (target === 'params') {
      Object.assign(req.params, result.data);
    } else {
      req.body = result.data;
    }
    next();
  };
}
