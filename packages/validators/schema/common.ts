import { z } from 'zod';
/**
 * Base pagination query parameters schema
 */
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  page: z.coerce.number().int().positive().optional().default(1),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Sorting options schema
 */
export const sortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof sortOrderSchema>;

/**
 * Common sorting fields schema
 */
export const commonSortFieldsSchema = z.enum(['createdAt', 'updatedAt']);
export type CommonSortFields = z.infer<typeof commonSortFieldsSchema>;

/**
 * Base query schema with pagination, sorting, and search capabilities
 */
export const baseQuerySchema = paginationQuerySchema.extend({
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  q: z.string().optional(),
  sortBy: commonSortFieldsSchema.optional().default('createdAt'),
  sortOrder: sortOrderSchema.optional().default('desc'),
});

/**
 * Autocomplete query schema
 */
export const autocompleteQuerySchema = baseQuerySchema.pick({
  limit: true,
  // locale: true,
  q: true,
});

export type AutocompleteQuery = z.infer<typeof autocompleteQuerySchema>;

export type BaseQuery = z.infer<typeof baseQuerySchema>;

/**
 * Pagination metadata for responses
 */
export const paginationMetaSchema = z.object({
  current: z.number().int().positive(),
  limit: z.number().int().positive(),
  next: z.number().int().positive().nullable(),
  page: z.number().int().positive(),
  pages: z.number().int().nonnegative(),
  prev: z.number().int().positive().nullable(),
  total: z.number().int().nonnegative(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/**
 * Boolean schema that accepts boolean or string values ("true"/"false") and coerces to boolean
 * going to be updated to use z.stringbool() in the future when v4 of Zod is released
 */
export const booleanSchema = z.union([z.boolean(), z.string()]).transform((val) => {
  if (typeof val === 'boolean') {
    return val;
  }
  if (typeof val === 'string') {
    return val.toLowerCase() === 'true';
  }
  return false;
});

export type BooleanSchema = z.infer<typeof booleanSchema>;

/**
 * Cameroon phone number schema
 * Format: 002376XXXXXXXX (14 characters - 00237 + 6 + 8 digits)
 */
export const cameroonPhoneNumberSchema = z
  .string()
  .regex(/^002376\d{8}$/, 'Phone number must be in format: 002376XXXXXXXX');

export type CameroonPhoneNumber = z.infer<typeof cameroonPhoneNumberSchema>;

export const tripQuerySchema = baseQuerySchema.extend({
  agencyId: z.string().optional(),
  agencyName: z.string().optional(),
  busId: z.string().optional(),
  endDate: z.iso.datetime().optional(),
  fromStation: z.string().optional(),
  search: z.string().optional(),
  startDate: z.iso.datetime().optional(),
  stationNames: z.string().optional(),
  status: z.string().optional(),
  toStation: z.string().optional(),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
});
export const stationQuerySchema = baseQuerySchema.extend({
  departureFrom: z.string().optional(),
  departureTo: z.string().optional(),
  exactPrice: z.number().int().positive().optional(),
  maxPrice: z.number().int().positive().optional(),
  minPrice: z.number().int().positive().optional(),
  search: z.string().optional(),
});
