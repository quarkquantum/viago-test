import type { HttpBindings } from '@hono/node-server';
import { getContext } from 'hono/context-storage';
import type { LanguageVariables } from 'hono/language';
import type { RequestIdVariables } from 'hono/request-id';
import { AppError } from '@/errors/index';
import type { AgencyModel, SessionModel, UserModel } from '@/types';

/**
 * Set node server bindings.
 *
 * @link https://hono.dev/docs/getting-started/nodejs#access-the-raw-node-js-apis
 */
type Bindings = HttpBindings & {
  /* ... */
};

/**
 * Define the context environment.
 *
 * @link https://hono.dev/docs/middleware/builtin/context-storage#usage
 */
export type HonoVariables = RequestIdVariables &
  LanguageVariables & {
    user: UserModel | null;
    session: SessionModel | null;
    agency: AgencyModel | null;
    authInstance?: 'admin' | 'alpha';
  };

export type HonoEnv = {
  Variables: HonoVariables;
  Bindings: Bindings;
};

/**
 * Access the current user from the request context.
 *
 * @returns The `UserModel` object of the currently authenticated user.
 */
export const getContextUser = () => {
  const _user = getContext<HonoEnv>().var.user;
  if (!_user) {
    throw new AppError({
      code: 'auth:no_user',
      message: 'No user found in the context.',
    });
  }
  return _user;
};

/**
 * Access the current session from the request context.
 *
 * @returns The `SessionModel` object of the currently authenticated session.
 */
export const getContextSession = () => {
  const _session = getContext<HonoEnv>().var.session;
  if (!_session) {
    throw new AppError({
      code: 'auth:invalid_session',
      message: 'No session found in the context.',
    });
  }
  return _session;
};

/**
 * Access the current agency from the request context.
 *
 * @returns The `AgencyModel` object of the currently authenticated agency.
 */
export const getContextAgency = () => {
  const _agency = getContext<HonoEnv>().var.agency;
  if (!_agency) {
    throw new AppError({
      code: 'auth:invalid_agency',
      message: 'No agency found in the context.',
    });
  }
  return _agency;
};
