// Error-types.ts - Consolidated error types

import type { DescribeRouteOptions } from 'hono-openapi';
import { resolver } from 'hono-openapi';
import { z } from 'zod';

// Simplified severity levels
export const severityLevels = ['error', 'warning', 'info', 'debug'] as const;
export type SeverityLevel = (typeof severityLevels)[number];

// Entity types matching Prisma schema models
export const entityTypes = [
  // Location entities
  'country',
  'state',
  'city',
  'language',
  'region',
  'timezone',
  'currency',

  // User entities
  'user',
  'role',
  'permission',
  'permissionOnRole',
  'permissionOnUser',
  'roleOnUser',
  'session',
  'account',
  'verification',
  'profile',
  'profilesocial',
  'useravailability',
  'profilenotificationsetting',
  'profileprivacysetting',
  'invitation',
  'agency',
  'cashier',
  'driver',
  'trip',
  'bus',
  'station',
  'booking',
  'seat',
  'passenger',
  'ticket',
] as const;
export type EntityType = (typeof entityTypes)[number];

// Simplified error categories
export const ErrorCategory = {
  AUTHENTICATION: 'auth',
  BUSINESS: 'business',
  DATABASE: 'database',
  EXTERNAL: 'external',
  HTTP: 'http',
  SYSTEM: 'system',
  VALIDATION: 'validation',
} as const;

export type ErrorCategory = (typeof ErrorCategory)[keyof typeof ErrorCategory];

// Define a single source of truth for errors
export const ErrorDefinitions = {
  // HTTP errors
  'http:bad_request': {
    category: ErrorCategory.HTTP,
    severity: 'warning' as SeverityLevel,
    status: 400,
    translationKey: 'errors.bad_request',
  },
  'http:unauthorized': {
    category: ErrorCategory.HTTP,
    severity: 'warning' as SeverityLevel,
    status: 401,
    translationKey: 'errors.unauthorized',
  },
  'http:forbidden': {
    category: ErrorCategory.HTTP,
    severity: 'warning' as SeverityLevel,
    status: 403,
    translationKey: 'errors.forbidden',
  },
  'http:not_found': {
    category: ErrorCategory.HTTP,
    severity: 'info' as SeverityLevel,
    status: 404,
    translationKey: 'errors.not_found',
  },
  'http:method_not_allowed': {
    category: ErrorCategory.HTTP,
    severity: 'warning' as SeverityLevel,
    status: 405,
    translationKey: 'errors.method_not_allowed',
  },
  'http:conflict': {
    category: ErrorCategory.HTTP,
    severity: 'warning' as SeverityLevel,
    status: 409,
    translationKey: 'errors.conflict',
  },
  'http:unprocessable_entity': {
    category: ErrorCategory.HTTP,
    severity: 'warning' as SeverityLevel,
    status: 422,
    translationKey: 'errors.unprocessable_entity',
  },
  'http:too_many_requests': {
    category: ErrorCategory.HTTP,
    severity: 'warning' as SeverityLevel,
    status: 429,
    translationKey: 'errors.too_many_requests',
  },
  'http:internal_server_error': {
    category: ErrorCategory.HTTP,
    severity: 'error' as SeverityLevel,
    status: 500,
    translationKey: 'errors.internal_server_error',
  },
  'http:service_unavailable': {
    category: ErrorCategory.HTTP,
    severity: 'error' as SeverityLevel,
    status: 503,
    translationKey: 'errors.service_unavailable',
  },

  // Database errors
  'database:connection_error': {
    category: ErrorCategory.DATABASE,
    severity: 'error' as SeverityLevel,
    status: 500,
    translationKey: 'errors.database_connection_error',
  },
  'database:query_error': {
    category: ErrorCategory.DATABASE,
    severity: 'error' as SeverityLevel,
    status: 500,
    translationKey: 'errors.database_query_error',
  },
  'database:unique_constraint': {
    category: ErrorCategory.DATABASE,
    severity: 'warning' as SeverityLevel,
    status: 409,
    translationKey: 'errors.unique_constraint_error',
  },
  'database:foreign_key': {
    category: ErrorCategory.DATABASE,
    severity: 'warning' as SeverityLevel,
    status: 400,
    translationKey: 'errors.foreign_key_constraint_error',
  },
  'database:not_found': {
    category: ErrorCategory.DATABASE,
    severity: 'info' as SeverityLevel,
    status: 404,
    translationKey: 'errors.record_not_found',
  },

  // Authentication errors
  'auth:invalid_credentials': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'warning' as SeverityLevel,
    status: 401,
    translationKey: 'errors.invalid_credentials',
  },
  'auth:no_user': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'warning' as SeverityLevel,
    status: 401,
    translationKey: 'errors.no_user',
  },
  'auth:token_expired': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'info' as SeverityLevel,
    status: 401,
    translationKey: 'errors.token_expired',
  },
  'auth:invalid_token': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'warning' as SeverityLevel,
    status: 401,
    translationKey: 'errors.invalid_token',
  },
  'auth:permission_denied': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'warning' as SeverityLevel,
    status: 403,
    translationKey: 'errors.permission_denied',
  },
  'auth:access_denied': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'warning' as SeverityLevel,
    status: 403,
    translationKey: 'errors.access_denied',
  },
  'auth:no_sysadmin': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'warning' as SeverityLevel,
    status: 403,
    translationKey: 'errors.no_sysadmin',
  },
  'auth:invalid_session': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'warning' as SeverityLevel,
    status: 401,
    translationKey: 'errors.invalid_session',
  },
  'auth:expired_token': {
    category: 'auth',
    severity: 'warning',
    status: 401,
    translationKey: 'errors.expired_token',
  },
  'auth:user_mismatch': {
    category: 'auth',
    severity: 'warning',
    status: 403,
    translationKey: 'errors.user_mismatch',
  },
  'auth:unauthorized': {
    category: 'auth',
    severity: 'warning',
    status: 401,
    translationKey: 'errors.unauthorized',
  },
  'auth:unsupported_strategy': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'error' as SeverityLevel,
    status: 400,
    translationKey: 'errors.unsupported_strategy',
  },
  'auth:email_taken': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'warning' as SeverityLevel,
    status: 409,
    translationKey: 'errors.email_taken',
  },
  'auth:no_password_found': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'warning' as SeverityLevel,
    status: 404,
    translationKey: 'errors.no_password_found',
  },
  'auth:email_not_verified': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'warning' as SeverityLevel,
    status: 403,
    translationKey: 'errors.email_not_verified',
  },
  'auth:email_already_verified': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'warning' as SeverityLevel,
    status: 409,
    translationKey: 'errors.email_already_verified',
  },
  'auth:invalid_agency': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'warning' as SeverityLevel,
    status: 404,
    translationKey: 'errors.no_agency_found',
  },
  'auth:cashier_not_found': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'warning' as SeverityLevel,
    status: 404,
    translationKey: 'errors.cashier_not_found',
  },
  'auth:user_banned': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'warning' as SeverityLevel,
    status: 403,
    translationKey: 'errors.user_banned',
  },
  // Validation errors
  'validation:error': {
    category: ErrorCategory.VALIDATION,
    severity: 'warning' as SeverityLevel,
    status: 400,
    translationKey: 'errors.validation_error',
  },
  'validation:invalid_input': {
    category: ErrorCategory.VALIDATION,
    severity: 'warning' as SeverityLevel,
    status: 400,
    translationKey: 'errors.invalid_input',
  },
  'validation:invalid_format': {
    category: ErrorCategory.VALIDATION,
    severity: 'warning' as SeverityLevel,
    status: 400,
    translationKey: 'errors.invalid_format',
  },

  // External service errors
  'external:service_error': {
    category: ErrorCategory.EXTERNAL,
    severity: 'error' as SeverityLevel,
    status: 502,
    translationKey: 'errors.external_service_error',
  },
  'external:timeout': {
    category: ErrorCategory.EXTERNAL,
    severity: 'error' as SeverityLevel,
    status: 504,
    translationKey: 'errors.external_service_timeout',
  },

  // Business logic errors
  'business:rule_violation': {
    category: ErrorCategory.BUSINESS,
    severity: 'warning' as SeverityLevel,
    status: 422,
    translationKey: 'errors.business_rule_violation',
  },
  'business:not_allowed': {
    category: ErrorCategory.BUSINESS,
    severity: 'warning' as SeverityLevel,
    status: 403,
    translationKey: 'errors.operation_not_allowed',
  },
  'business:limit_reached': {
    category: ErrorCategory.BUSINESS,
    severity: 'warning' as SeverityLevel,
    status: 429,
    translationKey: 'errors.resource_limit_reached',
  },
  'business:invalid_operation': {
    category: ErrorCategory.BUSINESS,
    severity: 'warning' as SeverityLevel,
    status: 400,
    translationKey: 'errors.invalid_operation',
  },
  // Agency errors
  'agency:no_agency': {
    category: ErrorCategory.BUSINESS,
    severity: 'warning' as SeverityLevel,
    status: 404,
    translationKey: 'errors.no_agency_found',
  },
  // System errors
  'system:unknown': {
    category: ErrorCategory.SYSTEM,
    severity: 'error' as SeverityLevel,
    status: 500,
    translationKey: 'errors.unknown_error',
  },
  'system:unexpected': {
    category: ErrorCategory.SYSTEM,
    severity: 'error' as SeverityLevel,
    status: 500,
    translationKey: 'errors.unexpected_error',
  },

  'agency:mismatch': {
    category: ErrorCategory.AUTHENTICATION,
    severity: 'warning' as SeverityLevel,
    status: 403,
    translationKey: 'errors.agency_mismatch',
  },
  'agency:required': {
    category: ErrorCategory.BUSINESS,
    severity: 'warning' as SeverityLevel,
    status: 400,
    translationKey: 'errors.agency_required',
  },
  'agency:invalid_status': {
    category: ErrorCategory.BUSINESS,
    severity: 'warning' as SeverityLevel,
    status: 400,
    translationKey: 'errors.agency_invalid_status',
  },
  'agency:not_found': {
    category: ErrorCategory.BUSINESS,
    severity: 'warning' as SeverityLevel,
    status: 404,
    translationKey: 'errors.agency_not_found',
  },
  'agency:suspended': {
    category: ErrorCategory.BUSINESS,
    severity: 'warning' as SeverityLevel,
    status: 403,
    translationKey: 'errors.agency_suspended',
  },
} as const;

// Generate the ErrorType enum from the ErrorDefinitions
export type ErrorType = keyof typeof ErrorDefinitions;

// Map severity levels to logging levels
export const severityToLoggingLevel: Record<SeverityLevel, 'error' | 'warn' | 'info' | 'debug'> = {
  debug: 'debug',
  error: 'error',
  info: 'info',
  warning: 'warn',
};

// Helper functions to extract specific data
export function getErrorStatus(errorType: ErrorType): number {
  return ErrorDefinitions[errorType].status;
}

export function getErrorSeverity(errorType: ErrorType): SeverityLevel {
  return ErrorDefinitions[errorType].severity;
}

export function getErrorTranslationKey(errorType: ErrorType): string {
  return ErrorDefinitions[errorType].translationKey;
}

export function getErrorCategory(errorType: ErrorType): ErrorCategory {
  return ErrorDefinitions[errorType].category;
}

// Map Prisma error codes to application error types
export const prismaErrorMap: Record<string, ErrorType> = {
  P1001: 'database:connection_error',
  P1002: 'database:connection_error',
  P1008: 'database:query_error',
  P1013: 'database:query_error',
  P1017: 'database:connection_error',
  P2000: 'validation:error',
  P2001: 'database:not_found',
  P2002: 'database:unique_constraint',
  P2003: 'database:foreign_key',
  P2005: 'validation:invalid_input',
  P2006: 'validation:invalid_input',
  P2007: 'validation:error',
  P2025: 'database:not_found',
  // Add other Prisma error mappings as needed
};

// Standard error response schema
export const errorSchema = z.object({
  entityType: z.enum(entityTypes).optional(),
  logId: z.string().optional(),
  message: z.string(),
  method: z.string().optional(),
  path: z.string().optional(),
  severity: z.enum(severityLevels),
  status: z.number(),
  timestamp: z.string().optional(),
  type: z.string(),
  userId: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof errorSchema>;

// Map HTTP status to error types
export function mapHttpStatusToErrorType(status: number): ErrorType {
  switch (status) {
    case 400: {
      return 'http:bad_request';
    }
    case 401: {
      return 'http:unauthorized';
    }
    case 403: {
      return 'http:forbidden';
    }
    case 404: {
      return 'http:not_found';
    }
    case 405: {
      return 'http:method_not_allowed';
    }
    case 409: {
      return 'http:conflict';
    }
    case 422: {
      return 'http:unprocessable_entity';
    }
    case 429: {
      return 'http:too_many_requests';
    }
    case 500: {
      return 'http:internal_server_error';
    }
    case 502: {
      return 'external:service_error';
    }
    case 503: {
      return 'http:service_unavailable';
    }
    case 504: {
      return 'external:timeout';
    }
    default: {
      return status >= 500 ? 'http:internal_server_error' : 'http:bad_request';
    }
  }
}

type Responses = DescribeRouteOptions['responses'];
/**
 * Schema for a failed response with errors.
 */
export const failWithErrorSchema = z.object({
  error: errorSchema,
  success: z.boolean().default(false),
});

/**
 * Set of common error responses with descriptions and schemas.  Includes: 400, 401, 403, 404, 429.
 */
export const errorResponses: Responses = {
  400: {
    content: {
      'application/json': {
        schema: resolver(failWithErrorSchema),
      },
    },
    description: 'Bad request: problem processing request.',
  },
  401: {
    content: {
      'application/json': {
        schema: resolver(failWithErrorSchema),
      },
    },
    description: 'Unauthorized: authentication required.',
  },
  403: {
    content: {
      'application/json': {
        schema: resolver(failWithErrorSchema),
      },
    },
    description: 'Forbidden: insufficient permissions.',
  },
  404: {
    content: {
      'application/json': {
        schema: resolver(failWithErrorSchema),
      },
    },
    description: 'Not found: resource does not exist.',
  },
  429: {
    content: {
      'application/json': {
        schema: resolver(failWithErrorSchema),
      },
    },
    description: 'Rate limit: too many requests.',
  },
};
