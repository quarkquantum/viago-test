import { useTranslation } from '@intlify/hono';
import { Prisma } from '@repo/database';
import { logger } from '@repo/logger';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';
import type { HonoEnv } from '@/lib/hono/context';
import type { ErrorContext } from '.';
import { AppError } from '.';
import type { EntityType, ErrorResponse } from './utils';
import { mapHttpStatusToErrorType, prismaErrorMap, severityToLoggingLevel } from './utils';

export type ErrorHandlerOptions = {
  isDevelopment: boolean;
  devDetails?: {
    includeStack?: boolean;
    includeCause?: boolean;
    includeDetails?: boolean;
  };
  monitoring?: {
    errorReporter?: (error: AppError, context: Context) => void;
  };
};

type TFunc = (key: string, params?: Record<string, unknown>) => string;
type ContextExtractor = (c: Context<HonoEnv>) => ErrorContext;
const extract: ContextExtractor = (c) => ({
  metadata: {
    headers: Object.fromEntries(c.req.raw.headers.entries()),
    query: Object.fromEntries(new URL(c.req.url).searchParams.entries()),
  },
  method: c.req.method,
  path: c.req.path,
  requestId: (() => {
    try {
      return c.get('requestId') as string | undefined;
    } catch {
      return;
    }
  })(),
  url: c.req.url,
  userId: c.get('user')?.id,
});

/**
 * Simple function to extract the most meaningful error message
 */
function getErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred';
  }

  if (error instanceof Error) {
    return error.message.trim() || 'An unexpected error occurred';
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Creates an error handler middleware for HonoJS with enhanced tracing
 */
export function createErrorHandler({
  isDevelopment,
  devDetails = {
    includeCause: true,
    includeDetails: true,
    includeStack: true,
  },
  monitoring = { errorReporter: undefined },
}: ErrorHandlerOptions) {
  return function handleError(err: unknown, c: Context) {
    const requestContext = extract(c);
    const startTime = performance.now();

    // Normalize to AppError
    let appError: AppError;
    if (err instanceof AppError) {
      // Preserve original stack trace if context is missing
      if (err.context) {
        appError = err;
      } else {
        appError = Object.assign(err, { context: requestContext });
      }
    } else if (err instanceof HTTPException) {
      appError = new AppError({
        cause: err,
        code: mapHttpStatusToErrorType(err.status),
        message: err.message,
        request: requestContext,
      });
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      const errorType = prismaErrorMap[err.code] || 'database:query_error';
      const meta = (err.meta ?? {}) as Record<string, unknown>;
      const modelName = typeof meta.modelName === 'string' ? meta.modelName : undefined;
      const entityType: EntityType | undefined = modelName ? (modelName.toLowerCase() as EntityType) : undefined;
      const parameters = (meta.param ?? meta.params) as unknown;
      appError = new AppError({
        cause: err,
        code: errorType,
        details: { modelName, parameters, prismaCode: err.code, target: meta.target },
        entityType,
        message: getErrorMessage(err),
        request: requestContext,
      });
      if (err instanceof Error && err.stack) {
        // Preserve the original stack trace
        appError.stack = err.stack;
      }
    } else if (err instanceof ZodError) {
      const formatted = err.issues.map((e) => ({
        code: e.code,
        message: e.message,
        path: e.path.join('.'),
      }));
      appError = new AppError({
        cause: err,
        code: 'validation:error',
        details: { validationErrors: formatted },
        message: 'Validation failed',
        request: requestContext,
      });
      if (err.stack) {
        // Preserve the original stack trace
        appError.stack = err.stack;
      }
    } else {
      appError = AppError.fromError(err, 'system:unexpected', requestContext);
      if (err instanceof Error && err.stack && !appError.stack) {
        // Preserve the original stack trace if it's an Error instance
        appError.stack = err.stack;
      }
    }

    // Log first — before translation so errors are always visible even if i18n fails
    const logLevel = severityToLoggingLevel[appError.severity];
    logger[logLevel]({
      error: {
        details: appError.details,
        entityType: appError.entityType,
        logId: appError.logId,
        message: appError.message,
        stack: isDevelopment ? appError.stack || '' : undefined,
        type: appError.code,
      },
      event: { category: appError.code.split(':')[0], subType: appError.code, type: 'error' },
      performance: { errorHandlingTimeMs: (performance.now() - startTime).toFixed(2) },
      request: { ...requestContext },
      user: { id: requestContext.userId },
    });

    let translatedMessage = appError.message;
    try {
      const t = useTranslation(c) as unknown as TFunc;
      translatedMessage = t(appError.translationKey, appError.params ?? {}) || appError.message;
    } catch {
      // i18n context unavailable — fall back to raw message
    }

    const errorResponse: ErrorResponse = {
      entityType: appError.entityType,
      logId: appError.logId,
      message: translatedMessage,
      method: requestContext.method,
      path: requestContext.path,
      severity: appError.severity,
      status: appError.status,
      timestamp: appError.timestamp.toISOString(),
      type: appError.code,
      userId: requestContext.userId,
    };

    if (monitoring.errorReporter) {
      try {
        monitoring.errorReporter(appError, c);
      } catch (error) {
        logger.warn({
          error: { message: getErrorMessage(error) },
          event: { type: 'error_reporting_failed' },
        });
      }
    }

    const responseBody: Record<string, unknown> = (() => {
      if (!isDevelopment) {
        return { ...errorResponse };
      }
      const payload: Record<string, unknown> = { ...errorResponse };
      if (devDetails.includeStack) {
        payload.stack = appError.stack;
      }
      if (devDetails.includeDetails) {
        payload.details = appError.details;
      }
      if (devDetails.includeCause && appError.cause) {
        payload.cause =
          appError.cause instanceof Error
            ? { message: appError.cause.message, stack: appError.cause.stack }
            : appError.cause;
      }
      return payload;
    })();

    return new HTTPException(appError.status as ContentfulStatusCode, {
      res: c.json(responseBody),
    });
  };
}

// No extra helpers; keep file flat for DX

/**
 * Error middleware for HonoJS
 */
export function errorMiddleware(options: ErrorHandlerOptions) {
  const handleError = createErrorHandler({
    ...options,
    devDetails: options.isDevelopment
      ? {
          includeCause: true,
          includeDetails: true,
          includeStack: true,
        }
      : options.devDetails,
  });

  return async (err: unknown, c: Context) => {
    if (err instanceof HTTPException) {
      logger.warn({
        error: { message: err.message, status: err.status },
        event: { type: 'http_exception' },
        request: { method: c.req.method, path: c.req.path },
      });
      return err.getResponse();
    }

    try {
      const error = handleError(err, c);
      return error.getResponse();
    } catch (handlerError) {
      // Error handler itself failed — log to stderr as last resort
      console.error('[ErrorHandler] Failed to handle error:', handlerError);
      console.error('[ErrorHandler] Original error:', err);
      return c.json({ message: 'Internal server error' }, 500);
    }
  };
}
