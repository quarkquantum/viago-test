// Framework-agnostic, typed application error primitives
import { nanoid } from 'nanoid';
import type { EntityType, ErrorType, SeverityLevel } from './utils';
import { ErrorDefinitions, getErrorSeverity, getErrorStatus, getErrorTranslationKey } from './utils';

// Lightweight request context snapshot used for logs/serialization
export type ErrorContext = {
  path?: string;
  method?: string;
  url?: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
};

export class AppError extends Error {
  readonly code: ErrorType;
  readonly status: number;
  readonly severity: SeverityLevel;
  readonly translationKey: string;
  readonly details?: unknown;
  readonly params?: Record<string, string | number>;
  readonly entityType?: EntityType;
  readonly logId: string;
  readonly context?: ErrorContext;
  readonly timestamp: Date;

  constructor(args: {
    code: ErrorType;
    message?: string;
    details?: unknown;
    params?: Record<string, string | number>;
    cause?: Error | unknown;
    entityType?: EntityType;
    // Prefer `context`; keep `request` for backward-compat during migration
    context?: ErrorContext;
    request?: ErrorContext;
  }) {
    const { code, context, request, message, details, params, cause, entityType } = args;
    const defaultMessage = code.split(':')[1]?.replace(/_/g, ' ') || 'An unexpected error occurred';
    super(message || defaultMessage);

    this.name = 'AppError';
    this.code = code;
    this.status = getErrorStatus(code);
    this.severity = getErrorSeverity(code);
    this.translationKey = getErrorTranslationKey(code);
    this.details = details;
    this.params = params;
    this.entityType = entityType;
    this.context = context ?? request;
    this.timestamp = new Date();
    this.logId = nanoid(10);

    if (cause) {
      this.cause = cause;
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  static fromError(error: unknown, defaultType: ErrorType = 'system:unexpected', request?: ErrorContext): AppError {
    if (error instanceof AppError) {
      return error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    const appError = new AppError({
      cause: error,
      code: defaultType,
      context: request,
      message: errorMessage,
    });
    // Preserve the original stack trace if available
    if (error instanceof Error && error.stack) {
      appError.stack = error.stack;
    }
    return appError;
  }

  static getErrorTypes(): ErrorType[] {
    return Object.keys(ErrorDefinitions) as ErrorType[];
  }

  static getErrorTypesByCategory(): Record<string, ErrorType[]> {
    const result: Record<string, ErrorType[]> = {};
    for (const errorType of Object.keys(ErrorDefinitions) as ErrorType[]) {
      const [category] = errorType.split(':') as [string];
      if (!result[category]) {
        result[category] = [];
      }
      result[category].push(errorType);
    }
    return result;
  }

  toJSON() {
    return {
      code: this.code,
      context: this.context,
      details: this.details,
      entityType: this.entityType,
      logId: this.logId,
      message: this.message,
      method: this.context?.method,
      name: this.name,
      params: this.params,
      path: this.context?.path,
      severity: this.severity,
      status: this.status,
      timestamp: this.timestamp.toISOString(),
      type: this.code,
      userId: this.context?.userId,
    };
  }
}
