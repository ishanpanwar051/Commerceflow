import { describe, it, expect } from 'vitest';
import { encodeCursor, decodeCursor, buildCursorResult } from '../src/common/pagination/cursor.pagination';
import { AppError } from '../src/common/errors/app.error';

describe('Cursor Pagination', () => {
  it('should encode and decode cursor', () => {
    const id = 'abc-123';
    const createdAt = new Date('2024-01-15T10:00:00Z');
    const cursor = encodeCursor(id, createdAt);
    const decoded = decodeCursor(cursor);

    expect(decoded.id).toBe(id);
    expect(decoded.createdAt.toISOString()).toBe(createdAt.toISOString());
  });

  it('should throw on invalid cursor', () => {
    expect(() => decodeCursor('invalid-cursor')).toThrow(AppError);
  });

  it('should build cursor result with hasMore', () => {
    const items = [
      { id: '3', createdAt: new Date('2024-01-03') },
      { id: '2', createdAt: new Date('2024-01-02') },
      { id: '1', createdAt: new Date('2024-01-01') },
    ];

    const result = buildCursorResult(items, 2);

    expect(result.data).toHaveLength(2);
    expect(result.pagination.hasMore).toBe(true);
    expect(result.pagination.nextCursor).toBeTruthy();
  });

  it('should indicate no more pages', () => {
    const items = [{ id: '1', createdAt: new Date() }];
    const result = buildCursorResult(items, 20);

    expect(result.pagination.hasMore).toBe(false);
    expect(result.pagination.nextCursor).toBeNull();
  });
});

describe('AppError', () => {
  it('should create error with status code and code', () => {
    const error = new AppError('Not found', 404, 'NOT_FOUND');
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });
});
