import { Request, Response, NextFunction } from 'express';

const DEFAULT_TIMEOUT = 30000;

export function timeout(ms: number = DEFAULT_TIMEOUT) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          message: 'Request timed out',
          code: 'TIMEOUT',
        });
      }
    }, ms);

    res.on('finish', () => {
      clearTimeout(timer);
    });

    next();
  };
}
