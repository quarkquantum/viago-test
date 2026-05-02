import { auth } from '@repo/auth/admin/server';
import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { resend } from '@repo/email';
import { TemporaryCredentialsEmailTemplate } from '@repo/email/emails';
import { keys as emailKeys } from '@repo/email/keys';
import { SystemRoles } from '@repo/shared';
import { agencyManagerIdSchema, agencyManagerQuerySchema, createAgencyManagerSchema, updateAgencyManagerSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { nanoid } from 'nanoid';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { sendSMS } from '@/lib/twilio';
import { AgencyManagerRoutes } from './routes';

const agencyManagerHandler = new Hono<HonoEnv>()
  .get(
    '/',
    ...AgencyManagerRoutes.listAgencyManagers,
    validator('query', agencyManagerQuerySchema),
    async (ctx) => {
      const query = ctx.req.valid('query');
      const { skip, take } = getPagination(query);
      const { sortBy, sortOrder, q, status } = query;

      const where: Prisma.AgencyMemberWhereInput = {
        role: { name: SystemRoles.AGENCY_MANAGER },
        ...(status && { status }),
        ...(q && {
          OR: [
            { user: { fullName: { contains: q, mode: 'insensitive' } } },
            { user: { email: { contains: q, mode: 'insensitive' } } },
            {
              user: {
                profile: {
                  phoneNumber: { contains: q, mode: 'insensitive' },
                },
              },
            },
            {
              agency: {
                name: { contains: q, mode: 'insensitive' },
              },
            },
          ],
        }),
      };

      const [data, total] = await Promise.all([
        prisma.agencyMember.findMany({
          include: {
            agency: true,
            user: {
              include: {
                profile: {
                  select: {
                    phoneNumber: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take,
          where,
        }),
        prisma.agencyMember.count({ where }),
      ]);

      return ctx.json(
        {
          data,
          pagination: getPaginationMeta({
            limit: query.limit,
            page: query.page,
            total,
          }),
        },
        200
      );
    }
  )
  .post(
    '/',
    ...AgencyManagerRoutes.createAgencyManager,
    validator('json', createAgencyManagerSchema),
    async (ctx) => {
      const t = await useTranslation(ctx);
      const { agencyId, email, firstName, lastName, phoneNumber } = ctx.req.valid('json');
      const password = nanoid(12);

      const response = await auth.api.createUser({
        body: {
          email,
          name: `${firstName} ${lastName}`,
          password,
        },
        headers: ctx.req.header(),
      });

      if (!response || (typeof response === 'object' && 'error' in response)) {
        throw new AppError({
          code: 'database:query_error',
          message: t('agencyManager.api.error.create_failed'),
        });
      }

      const user = response.user;

      const manager = await prisma.$transaction(async (tx) => {
        await tx.user.update({
          data: {
            emailVerified: true,
            mustChangePassword: true,
            role: SystemRoles.AGENCY_MANAGER,
            profile: {
              upsert: {
                create: { firstName, lastName, phoneNumber },
                update: { firstName, lastName, phoneNumber },
              },
            },
          },
          where: { id: user.id },
        });

        return await tx.agencyMember.create({
          data: {
            agencyId,
            userId: user.id,
            role: { connect: { name: SystemRoles.AGENCY_MANAGER } },
          },
          include: {
            user: { include: { profile: true } },
          },
        });
      });

      const loginUrl = `${ctx.req.header('origin')}/login`;
      const username = `${firstName} ${lastName}`.trim() || email.split('@')[0] || 'User';

      await resend.emails.send({
        from: emailKeys().RESEND_FROM as string,
        react: TemporaryCredentialsEmailTemplate({
          email,
          loginUrl,
          temporaryPassword: password,
          username,
        }),
        subject: 'Your Viago agency manager credentials',
        to: [email],
      });

      if (phoneNumber) {
        await sendSMS({
          body: `Viago - Login: ${email} | Temporary password: ${password}. You must set a new password at first login.`,
          to: phoneNumber,
        });
      }

      return ctx.json({ data: manager, message: t('agencyManager.api.success.created') }, 201);
    }
  )
  .get(
    '/:identifier',
    ...AgencyManagerRoutes.getAgencyManager,
    validator('param', agencyManagerIdSchema),
    async (ctx) => {
      const { identifier } = ctx.req.valid('param');

      const manager = await prisma.agencyMember.findFirst({
        where: {
          id: identifier,
          role: { name: SystemRoles.AGENCY_MANAGER },
        },
        include: {
          agency: true,
          user: {
            include: {
              profile: {
                select: {
                  phoneNumber: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      if (!manager) {
        throw new AppError({
          code: 'not_found',
          message: 'Agency manager not found',
        });
      }

      return ctx.json({ data: manager }, 200);
    }
  )
  .patch(
    '/:identifier',
    ...AgencyManagerRoutes.updateAgencyManager,
    validator('param', agencyManagerIdSchema),
    validator('json', updateAgencyManagerSchema),
    async (ctx) => {
      const { identifier } = ctx.req.valid('param');
      const data = ctx.req.valid('json');

      const existing = await prisma.agencyMember.findFirst({
        where: {
          id: identifier,
          role: { name: SystemRoles.AGENCY_MANAGER },
        },
        include: { user: true },
      });

      if (!existing) {
        throw new AppError({
          code: 'not_found',
          message: 'Agency manager not found',
        });
      }

      const manager = await prisma.$transaction(async (tx) => {
        if (data.firstName || data.lastName || data.phoneNumber) {
          await tx.user.update({
            data: {
              name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : undefined,
              profile: {
                upsert: {
                  create: {
                    firstName: data.firstName ?? '',
                    lastName: data.lastName ?? '',
                    phoneNumber: data.phoneNumber ?? '',
                  },
                  update: {
                    ...(data.firstName && { firstName: data.firstName }),
                    ...(data.lastName && { lastName: data.lastName }),
                    ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
                  },
                },
              },
            },
            where: { id: existing.userId },
          });
        }

        if (data.status || data.agencyId) {
          await tx.agencyMember.update({
            data: {
              ...(data.status && { status: data.status }),
              ...(data.agencyId && { agencyId: data.agencyId }),
            },
            where: { id: identifier },
          });
        }

        return await tx.agencyMember.findUnique({
          where: { id: identifier },
          include: {
            agency: true,
            user: {
              include: {
                profile: {
                  select: {
                    phoneNumber: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        });
      });

      return ctx.json({ data: manager, message: 'Agency manager updated successfully' }, 200);
    }
  )
  .delete(
    '/:identifier',
    ...AgencyManagerRoutes.deleteAgencyManager,
    validator('param', agencyManagerIdSchema),
    async (ctx) => {
      const { identifier } = ctx.req.valid('param');

      const existing = await prisma.agencyMember.findFirst({
        where: {
          id: identifier,
          role: { name: SystemRoles.AGENCY_MANAGER },
        },
        include: { user: true },
      });

      if (!existing) {
        throw new AppError({
          code: 'not_found',
          message: 'Agency manager not found',
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.agencyMember.delete({
          where: { id: identifier },
        });

        await tx.user.delete({
          where: { id: existing.userId },
        });
      });

      return ctx.json({ message: 'Agency manager deleted successfully' }, 200);
    }
  );

export default agencyManagerHandler;
