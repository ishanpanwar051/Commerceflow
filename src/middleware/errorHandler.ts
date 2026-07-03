import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../config/logger';
import { config } from '../config';

interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  [key: string]: unknown;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({ err, requestId: (req as any).requestId }, 'Error occurred');

  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let errors: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    if (err instanceof ValidationError) {
      errors = err.fields;
    }
  } else if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.');
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    errors = fieldErrors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Resource already exists';
      code = 'CONFLICT';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
      code = 'NOT_FOUND';
    } else {
      message = 'Database error';
      code = 'DATABASE_ERROR';
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 422;
    message = 'Invalid data provided';
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
    code = 'UNAUTHORIZED';
  }

  const response: Record<string, unknown> = {
    success: false,
    message,
    code,
  };
  if (errors) response.errors = errors;
  if (config.isDev) response.stack = err.stack;

  res.status(statusCode).json(response);
}
