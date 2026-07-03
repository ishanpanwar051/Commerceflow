import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { ApiResponse, PaginationMeta, CursorPaginationMeta, AnyPaginationMeta } from '../types';

export function generateId(): string {
  return uuidv4();
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: AnyPaginationMeta
): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  res.status(statusCode).json(response);
}

export function calculatePaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function calculateTax(amount: number, rate = 0.08): number {
  return Math.round(amount * rate * 100) / 100;
}

export function calculateShipping(amount: number): number {
  if (amount >= 50) return 0;
  return 5.99;
}

export function parsePaginationQuery(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 10));
  const sort = (query.sort as string) || 'createdAt';
  const order = ((query.order as string) || 'desc') as 'asc' | 'desc';
  return { page, limit, sort, order };
}

export function parseCursorPaginationQuery(query: Record<string, unknown>) {
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 10));
  const cursor = query.cursor as string | undefined;
  const sort = (query.sort as string) || 'createdAt';
  const order = ((query.order as string) || 'desc') as 'asc' | 'desc';
  return { cursor, limit, sort, order };
}
