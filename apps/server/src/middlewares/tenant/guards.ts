import { createMiddleware } from 'hono/factory';
import { AppError } from '@/errors';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextAgency } from '@/lib/tenant/context';

export const requireAgencyMatch = createMiddleware<HonoEnv>(async (ctx, next) => {
  const contextAgency = getContextAgency();
  const requestAgency = ctx.var.agency;

  if (requestAgency && contextAgency.id !== requestAgency.id) {
    throw new AppError({
      code: 'agency:mismatch',
      message: 'Access denied: Agency mismatch',
    });
  }

  await next();
});

export const requireActiveAgency = createMiddleware<HonoEnv>(async (ctx, next) => {
  const agency = getContextAgency();

  if (agency.status !== 'ACTIVE') {
    throw new AppError({
      code: 'agency:invalid_status',
      message: `Agency is not active. Current status: ${agency.status}`,
    });
  }

  await next();
});
