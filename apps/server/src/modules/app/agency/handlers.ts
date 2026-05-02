import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { AgencyStatus } from '@repo/shared/constants';
import { agencyIdSchema, baseQuerySchema, createAgencySchema, updateAgencySchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import slugify from 'slugify';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { AgencyRoutes } from './routes';

const agencyHandler = new Hono<HonoEnv>()
  .get('/', ...AgencyRoutes.agency, validator('query', baseQuerySchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { sortBy, sortOrder, q } = query;

    const where: Prisma.AgencyWhereInput = {
      ...(q && {
        OR: [
          {
            name: { contains: q, mode: 'insensitive' },
          },
          {
            description: {
              contains: q,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.agency.findMany({
        include: {
          owner: {
            select: {
              email: true,
              fullName: true,
              id: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
        where,
      }),
      prisma.agency.count({ where }),
    ]);

    return ctx.json(
      {
        data,
        pagination: {
          skip,
          take,
          total,
        },
      },
      200
    );
  })

  .get('/:identifier', ...AgencyRoutes.agency, validator('param', agencyIdSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.valid('param');

    const agency = await prisma.agency.findUnique({
      include: {
        owner: {
          select: {
            email: true,
            fullName: true,
            id: true,
          },
        },
      },
      where: { id: identifier },
    });

    if (!agency) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'agency',
        message: t('agency.api.error.not_found'),
      });
    }

    return ctx.json(
      {
        data: agency,
      },
      200
    );
  })

  .post('/', ...AgencyRoutes.agency, validator('json', createAgencySchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { ...agencyData } = ctx.req.valid('json');
    const newAgency = await prisma.agency.create({
      data: {
        description: agencyData.description,
        name: agencyData.name,
        slug: slugify(agencyData.name),
        status: agencyData.status ?? AgencyStatus.ACTIVE,
      },
      include: {
        owner: {
          select: {
            email: true,
            fullName: true,
            id: true,
          },
        },
      },
    });

    return ctx.json(
      {
        data: newAgency,
        message: t('agency.api.success.created'),
      },
      201
    );
  })

  .put('/:id', ...AgencyRoutes.agency, validator('json', updateAgencySchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { id } = ctx.req.param();
    const updateData = ctx.req.valid('json');

    const existingAgency = await prisma.agency.findUnique({
      include: {
        owner: true,
      },
      where: { id },
    });

    if (!existingAgency) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'agency',
        message: t('agency.api.error.not_found'),
      });
    }
    const updatedAgency = await prisma.agency.update({
      data: updateData,
      include: {
        owner: {
          select: {
            email: true,
            fullName: true,
            id: true,
          },
        },
      },
      where: { id },
    });

    return ctx.json(
      {
        data: updatedAgency,
        message: t('agency.api.success.updated'),
        status: 200,
      },
      200
    );
  })
  .patch('/:identifier/activate', ...AgencyRoutes.activateAgency, validator('param', agencyIdSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.valid('param');

    const existingAgency = await prisma.agency.findUnique({
      include: {
        owner: {
          select: {
            email: true,
            fullName: true,
            id: true,
          },
        },
      },
      where: { id: identifier },
    });

    if (!existingAgency) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'agency',
        message: t('agency.api.error.not_found'),
      });
    }

    if (existingAgency.status === AgencyStatus.ACTIVE) {
      return ctx.json(
        {
          data: existingAgency,
          message: t('agency.api.success.already_active'),
        },
        200
      );
    }

    const updatedAgency = await prisma.agency.update({
      data: {
        status: AgencyStatus.ACTIVE,
      },
      include: {
        owner: {
          select: {
            email: true,
            fullName: true,
            id: true,
          },
        },
      },
      where: { id: identifier },
    });

    return ctx.json(
      {
        data: updatedAgency,
        message: t('agency.api.success.activated'),
      },
      200
    );
  })
  .patch(
    '/:identifier/deactivate',
    ...AgencyRoutes.deactivateAgency,
    validator('param', agencyIdSchema),
    async (ctx) => {
      const t = await useTranslation(ctx);
      const { identifier } = ctx.req.valid('param');

      const existingAgency = await prisma.agency.findUnique({
        include: {
          owner: {
            select: {
              email: true,
              fullName: true,
              id: true,
            },
          },
        },
        where: { id: identifier },
      });

      if (!existingAgency) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'agency',
          message: t('agency.api.error.not_found'),
        });
      }

      if (existingAgency.status === AgencyStatus.INACTIVE) {
        return ctx.json(
          {
            data: existingAgency,
            message: t('agency.api.success.already_inactive'),
          },
          200
        );
      }

      const updatedAgency = await prisma.agency.update({
        data: {
          status: AgencyStatus.INACTIVE,
        },
        include: {
          owner: {
            select: {
              email: true,
              fullName: true,
              id: true,
            },
          },
        },
        where: { id: identifier },
      });

      return ctx.json(
        {
          data: updatedAgency,
          message: t('agency.api.success.deactivated'),
        },
        200
      );
    }
  )
  .delete('/:identifier', ...AgencyRoutes.agency, validator('param', agencyIdSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.valid('param');

    // Check if station exists and has related bookings
    const existingAgency = await prisma.agency.findUnique({
      include: {
        owner: {
          select: {
            email: true,
            fullName: true,
            id: true,
          },
        },
      },
      where: { id: identifier },
    });

    if (!existingAgency) {
      throw new AppError({
        code: 'http:not_found',
        context: {
          method: ctx.req.method,
          path: ctx.req.path,
        },
        entityType: 'agency',
        message: t('agency.api.error.not_found'),
      });
    }

    await prisma.agency.delete({
      where: { id: identifier },
    });

    return ctx.json(
      {
        message: t('agency.api.success.deleted'),
      },
      200
    );
  });

export default agencyHandler;
