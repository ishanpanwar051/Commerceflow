import { describe, it, expect } from 'vitest';
import { calculatePaginationMeta } from '../../src/utils/helpers';

describe('Pagination', () => {
  it('should calculate pagination meta correctly', () => {
    const meta = calculatePaginationMeta(100, 1, 10);
    expect(meta.total).toBe(100);
    expect(meta.page).toBe(1);
    expect(meta.limit).toBe(10);
    expect(meta.totalPages).toBe(10);
  });

  it('should handle empty results', () => {
    const meta = calculatePaginationMeta(0, 1, 10);
    expect(meta.totalPages).toBe(0);
  });
});
