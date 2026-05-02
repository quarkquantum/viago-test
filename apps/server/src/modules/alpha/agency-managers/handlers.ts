import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { AgencyManagerStatus, SystemRoles } from '@repo/shared';
import { agencyManagerIdSchema, agencyManagerQuerySchema, updateAgencyManagerSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { AlphaAgencyManagerRoutes } from './routes';

const alphaAgencyManagerHandler = new Hono<HonoEnv>()
  .get(
    '/',
    ...AlphaAgencyManagerRoutes.listAgencyManagers,
    validator('query', agencyManagerQuerySchema),
    async (ctx) => {
      const query = ctx.req.valid('query');
      const { skip, take } = getPagination(query);
      const { sortBy, sortOrder, q, status } = query;

      const where: Prisma.AgencyMemberWhereInput = {
        role: { name: 'OWNER' },
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
  .get(
    '/:identifier',
    ...AlphaAgencyManagerRoutes.getAgencyManager,
    validator('param', agencyManagerIdSchema),
    async (ctx) => {
      const { identifier } = ctx.req.valid('param');

      const manager = await prisma.agencyMember.findUnique({
        include: {
          agency: true,
          user: {
            include: {
              profile: true,
            },
          },
          role: true,
        },
        where: { id: identifier },
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
    ...AlphaAgencyManagerRoutes.updateAgencyManager,
    validator('param', agencyManagerIdSchema),
    validator('json', updateAgencyManagerSchema),
    async (ctx) => {
      const { identifier } = ctx.req.valid('param');
      const { firstName, lastName, phoneNumber, status, agencyId } = ctx.req.valid('json');

      const existingManager = await prisma.agencyMember.findUnique({
        where: { id: identifier },
        include: { user: { include: { profile: true } }, agency: true },
      });

      if (!existingManager) {
        throw new AppError({
          code: 'not_found',
          message: 'Agency manager not found',
        });
      }

      const updatedManager = await prisma.agencyMember.update({
        where: { id: identifier },
        data: {
          ...(status && { status }),
          ...(agencyId && { agency: { connect: { id: agencyId } ,}}),
          user: {
            update: {
              ...(firstName || lastName || phoneNumber
                ? {
                    profile: {
                      update: {
                        ...(firstName && { firstName }),
                        ...(lastName && { lastName }),
                        ...(phoneNumber && { phoneNumber }),
                      },
                    },
                  }
                : {}),
            },
          },
        },
        include: {
          agency: true,
          user: {
            include: {
              profile: true,
            },
          },
          role: true,
        },
      });

      return ctx.json({ data: updatedManager }, 200);
    }
  );

export default alphaAgencyManagerHandler;