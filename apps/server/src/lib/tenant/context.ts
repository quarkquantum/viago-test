import { getContext } from 'hono/context-storage';
import type { HonoEnv } from '../lib/hono/context';

export type AgencyContext = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

export const getContextAgency = (): AgencyContext => {
  const ctx = getContext<HonoEnv>();
  const agency = ctx.var.agency;
  if (!agency) {
    throw new Error('No agency found in the context');
  }
  return agency;
};

export const tryGetContextAgency = (): AgencyContext | null => {
  const ctx = getContext<HonoEnv>();
  return ctx.var.agency ?? null;
};

export const hasContextAgency = (): boolean => {
  return tryGetContextAgency() !== null;
};
