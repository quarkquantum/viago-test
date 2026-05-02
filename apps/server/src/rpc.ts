import { hc } from 'hono/client';
import type { AppType } from './routes';

// This is a trick to calculate the type when compiling
export const hcWithType = (...args: Parameters<typeof hc>) => hc<AppType>(...args);
export type Client = ReturnType<typeof hcWithType>;

export type { InferRequestType, InferResponseType } from 'hono/client';
