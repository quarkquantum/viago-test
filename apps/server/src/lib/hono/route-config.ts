import type { Context, Env, MiddlewareHandler, Next } from 'hono';
import type { DescribeRouteOptions } from 'hono-openapi';
import { describeRoute } from 'hono-openapi';
import type { HonoEnv } from './context';

/**
 * A single middleware handler function compatible with Hono
 * @template E - The environment type, defaults to HonoEnv
 */
export type RouteMiddleware<E extends Env = HonoEnv> = MiddlewareHandler<E>;

/**
 * An array of middleware handlers
 * @template E - The environment type, defaults to HonoEnv
 */
export type RouteMiddlewareArray<E extends Env = HonoEnv> = readonly RouteMiddleware<E>[];

/**
 * Middleware input can be either a single middleware function or an array of middleware functions.
 * This also supports Hono's combine middleware functions (some, every, except).
 *
 * @template E - The environment type, defaults to HonoEnv
 * @example
 * // Single middleware
 * const middleware: MiddlewareInput = isAuthenticated;
 *
 * // Array of middleware
 * const middleware: MiddlewareInput = [isAuthenticated, hasAccess];
 *
 * // Combined middleware from hono/combine
 * const middleware: MiddlewareInput = some(isAdmin, every(isAuthenticated, hasAccess));
 */
export type MiddlewareInput<E extends Env = HonoEnv> = RouteMiddleware<E> | RouteMiddlewareArray<E>;

/**
 * Options for configuring a route with OpenAPI documentation, guard middleware, and optional additional middleware
 *
 * @template E - The environment type, defaults to HonoEnv
 */
export interface RouteConfigOptions<E extends Env = HonoEnv> extends DescribeRouteOptions {
  /**
   * Guard middleware that will be executed first
   * Can be a single middleware function, an array of middleware functions,
   * or a combined middleware from hono/combine (some, every, except)
   *
   * @example
   * // Single middleware
   * guard: isAuthenticated
   *
   * // Array of middleware
   * guard: [isAuthenticated, hasOrgAccess]
   *
   * // Combined middleware
   * guard: some(isAdmin, every(isAuthenticated, hasOrgAccess))
   */
  guard?: MiddlewareInput<E>;

  /**
   * Optional additional middleware to be executed after guard passes
   * Can be a single middleware function, an array of middleware functions,
   * or a combined middleware from hono/combine (some, every, except)
   *
   * @example
   * // Single middleware
   * middleware: logRequest
   *
   * // Array of middleware
   * middleware: [validateInput, sanitizeData]
   *
   * // Combined middleware
   * middleware: every(validateBody, validateQuery)
   */
  middleware?: MiddlewareInput<E>;
}

/**
 * Converts any middleware input (single function, array, or combined middleware)
 * into a unified middleware handler
 *
 * @template E - The environment type
 * @param input - Middleware input to unify
 * @returns A single middleware handler function
 * @internal
 */
const unifyMiddleware = <E extends Env>(input: MiddlewareInput<E>): RouteMiddleware<E> => {
  // If it's already a function, return it
  if (typeof input === 'function') {
    return input;
  }

  // If it's an array, create a unified middleware
  if (Array.isArray(input) && input.length > 0) {
    return async (ctx: Context<E>, next: Next) => {
      let index = 0;

      // Create a recursive next function that calls the next middleware
      const runNext = async (): Promise<void> => {
        // If we've run all middleware, call the original next
        if (index >= input.length) {
          return next();
        }

        // Get current middleware and increment index
        const middleware = input[index++];

        // Run middleware with our custom next function
        await middleware(ctx, runNext);
      };

      // Start the chain
      await runNext();
    };
  }

  // Empty array or invalid input, just pass through
  return (_, next) => next();
};

/**
 * Creates a new route configuration with separate middlewares.
 * Returns an array of middleware for easier use in Hono routes.
 *
 * @template E - The environment type, defaults to HonoEnv
 * @param options - Configuration options for the route
 * @returns An array containing the OpenAPI middleware, followed by the guard and optional middleware
 *
 * @example
 * // Define routes
 * const routes = {
 *   getUser: createRouteConfig({
 *     guard: isAuthenticated,
 *     description: 'Get user profile',
 *     responses: {
 *       200: { description: 'User found' },
 *       404: { description: 'User not found' }
 *     }
 *   })
 * };
 *
 * // Using with Hono
 * app.get('/users/:id', ...routes.getUser, (c) => c.json({ user: {...} }));
 */
export const createRouteConfig = <E extends Env = HonoEnv>({
  guard,
  middleware,
  ...routeConfig
}: RouteConfigOptions<E>): [RouteMiddleware<E>, RouteMiddleware<E>] => {
  // Create OpenAPI middleware
  const openApiMiddleware = describeRoute(routeConfig) as RouteMiddleware<E>;

  // Create unified handlers for guard and middleware
  const guardHandler = unifyMiddleware<E>(guard);

  // Compose final middleware with optional additional middleware
  let finalMiddleware: RouteMiddleware<E>;

  if (middleware) {
    const middlewareHandler = unifyMiddleware<E>(middleware);
    finalMiddleware = async (ctx, next) => {
      await guardHandler(ctx, async () => {
        await middlewareHandler(ctx, next);
      });
    };
  } else {
    finalMiddleware = guardHandler;
  }

  // Return array with exact types to help TypeScript inference
  return [openApiMiddleware, finalMiddleware];
};
