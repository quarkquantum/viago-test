import { prisma } from '@repo/database';
import { createMiddleware } from 'hono/factory';
import { AppError } from '@/errors';
import type { HonoEnv } from '@/lib/hono/context';

export interface ResolveAgencyOptions {
  required?: boolean;
}

function extractAgencyIdentifier(request: Request): string | null {
  const url = new URL(request.url);

  const subdomain = url.hostname.split('.')[0];
  if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
    return subdomain;
  }

  const headerAgency = request.headers.get('X-Agency-ID');
  if (headerAgency) {
    return headerAgency.toLowerCase().trim();
  }

  const pathMatch = url.pathname.match(/^\/api\/agency\/([a-zA-Z0-9-]+)/);
  if (pathMatch) {
    return pathMatch[1].toLowerCase();
  }

  return null;
}

export const resolveAgency = createMiddleware<HonoEnv>(async (ctx, next) => {
  const agencyIdentifier = extractAgencyIdentifier(ctx.req.raw);

  if (!agencyIdentifier) {
    ctx.set('agency', null);
    return next();
  }

  const agency = await prisma.agency.findFirst({
    where: {
      OR: [
        { id: agencyIdentifier },
        { slug: agencyIdentifier },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
    },
  });

  if (!agency) {
    throw new AppError({
      code: 'agency:not_found',
      message: `Agency "${agencyIdentifier}" not found`,
    });
  }

  if (agency.status === 'SUSPENDED') {
    throw new AppError({
      code: 'agency:suspended',
      message: `Agency "${agency.name}" is currently suspended`,
    });
  }

  if (agency.status !== 'ACTIVE') {
    throw new AppError({
      code: 'agency:invalid_status',
      message: `Agency "${agency.name}" has invalid status: ${agency.status}`,
    });
  }

  ctx.set('agency', agency);
  await next();
});

export const requireAgency = createMiddleware<HonoEnv>(async (ctx, next) => {
  const agency = ctx.var.agency;
  if (!agency) {
    throw new AppError({
      code: 'agency:required',
      message: 'Agency identifier is required. Provide X-Agency-ID header or use subdomain.',
    });
  }
  await next();
});

export const resolveAgencyOptional = (options: ResolveAgencyOptions = {}) =>
  createMiddleware<HonoEnv>(async (ctx, next) => {
    const agencyIdentifier = extractAgencyIdentifier(ctx.req.raw);

    if (!agencyIdentifier) {
      if (options.required) {
        throw new AppError({
          code: 'agency:required',
          message: 'Agency identifier is required',
        });
      }
      ctx.set('agency', null);
      return next();
    }

    const agency = await prisma.agency.findFirst({
      where: {
        OR: [
          { id: agencyIdentifier },
          { slug: agencyIdentifier },
        ],
      },
    });

    if (!agency && options.required) {
      throw new AppError({
        code: 'agency:not_found',
        message: `Agency "${agencyIdentifier}" not found`,
      });
    }

    if (agency && agency.status === 'SUSPENDED') {
      throw new AppError({
        code: 'agency:suspended',
        message: 'Agency is suspended',
      });
    }

    ctx.set('agency', agency);
    await next();
  });
