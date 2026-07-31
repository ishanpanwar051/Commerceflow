import { Request, Response, NextFunction } from 'express';

const DEFAULT_TIMEOUT = 30000;

export function timeout(ms: number = DEFAULT_TIMEOUT) {
  return (req: Request, res: Response, next: NextFunction): void => {
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          message: 'Request timed out',
          code: 'TIMEOUT',
        });
      }
      // Abort the underlying connection to stop further processing
      if (!req.destroyed) {
        req.destroy();
      }
    }, ms);

    res.on('finish', () => {
      if (!timedOut) {
        clearTimeout(timer);
      }
    });

    res.on('close', () => {
      if (!timedOut) {
        clearTimeout(timer);
      }
    });

    // Wrap next to prevent further middleware execution after timeout
    const originalNext = next;
    const wrappedNext = (err?: unknown) => {
      if (timedOut) {
        return;
      }
      originalNext(err);
    };

    wrappedNext();
  };
}
