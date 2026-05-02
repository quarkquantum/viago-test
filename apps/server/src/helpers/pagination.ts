import type { PaginationMeta } from '@repo/validators';

/**
 * Helper function to calculate pagination skip and take values
 * Use getPaginationMeta instead for consistent pagination handling
 */
export function getPagination(query: { page?: number; limit?: number }) {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;
  const take = limit;

  return { skip, take };
}

/**
 * Helper function to calculate pagination metadata
 */
export function getPaginationMeta(data: { total: number; page: number; limit: number }): PaginationMeta {
  const { total, page, limit } = data;
  const pages = Math.ceil(total / limit);

  return {
    current: page,
    limit,
    next: page < pages ? page + 1 : null,
    page,
    pages,
    prev: page > 1 ? page - 1 : null,
    total,
  };
}
