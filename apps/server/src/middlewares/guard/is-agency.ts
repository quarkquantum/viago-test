import { auth as adminAuth } from '@repo/auth/admin/server';
import { auth as alphaAuth } from '@repo/auth/alpha/server';
import { auth as agencyAuth } from '@repo/auth/agency/server';
import { prisma } from '@repo/database';
import { AgencyMemberStatus, SystemRoles } from '@repo/shared';
import { createMiddleware } from 'hono/factory';
import { AppError } from '@/errors/index';
import type { HonoEnv } from '@/lib/hono/context';
import type { UserSessionModel } from '@/types';

export const isAgency = createMiddleware<HonoEnv>(async (ctx, next) => {
  let session: UserSessionModel | null = null;

  const authConfigs = [
    { auth: agencyAuth, name: 'agency' as const },
    { auth: adminAuth, name: 'admin' as const },
    { auth: alphaAuth, name: 'alpha' as const },
  ];

  for (const config of authConfigs) {
    const sess = await config.auth.api.getSession({
      headers: ctx.req.raw.headers,
    });
    if (sess && (sess as unknown as UserSessionModel)?.user) {
      session = sess as unknown as UserSessionModel;
      break;
    }
  }

  if (!session || !session.user) {
    ctx.set('user', null);
    ctx.set('session', null);
    throw new AppError({
      cause: 'Session not found',
      code: 'auth:invalid_session',
      message: 'User session not found',
    });
  }

  const ownerRole = await prisma.agencyRole.findUnique({
    where: { name: SystemRoles.OWNER },
  });

  if (!ownerRole) {
    throw new AppError({
      cause: 'OWNER role not found',
      code: 'auth:configuration_error',
      message: 'Agency owner role is not configured in the system',
    });
  }

  const membership = await prisma.agencyMember.findFirst({
    where: {
      userId: session.user.id,
      roleId: ownerRole.id,
      status: AgencyMemberStatus.ACTIVE,
    },
    include: {
      agency: {
        include: {
          owner: {
            select: { email: true, fullName: true, profile: true, id: true },
          },
        },
      },
    },
  });

  if (!membership) {
    const hasAnyMembership = await prisma.agencyMember.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        role: true,
      },
    });

    if (!hasAnyMembership) {
      throw new AppError({
        cause: 'No agency membership found',
        code: 'auth:unauthorized',
        message: 'User is not a member of any agency',
      });
    }

    throw new AppError({
      cause: `User has role: ${hasAnyMembership.role.name}, but OWNER role is required`,
      code: 'auth:forbidden',
      message: `Access denied. Your role is "${hasAnyMembership.role.name}" but you need the "OWNER" role to access this resource.`,
    });
  }

  ctx.set('user', session.user);
  ctx.set('session', session.session);
  ctx.set('agency', membership.agency);
  await next();
});