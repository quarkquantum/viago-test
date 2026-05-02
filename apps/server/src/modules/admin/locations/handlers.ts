import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { z } from 'zod';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { LocationRoutes } from './routes';

const locationIdSchema = z.object({
  identifier: z.string().min(1),
});

const createLocationSchema = z.object({
  agencyId: z.string().min(1),
  cityId: z.string().min(1),
  name: z.string().min(1).max(255),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

const updateLocationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  status: z.string().optional(),
});

const locationQuerySchema = z.object({
  agencyId: z.string().optional(),
  q: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.enum(['createdAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const locationHandler = new Hono<HonoEnv>()
  .get('/', ...LocationRoutes.listLocations, validator('query', locationQuerySchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { q, agencyId } = query;

    const where: Prisma.AgencyLocationWhereInput = {
      ...(agencyId && { agencyId }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
          { agency: { name: { contains: q, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.agencyLocation.findMany({
        include: {
          agency: { select: { id: true, name: true, slug: true } },
          city: { select: { id: true, name: true } },
          _count: { select: { members: true, trips: true } },
        },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip,
        take,
        where,
      }),
      prisma.agencyLocation.count({ where }),
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
  })
  .post('/', ...LocationRoutes.createLocation, validator('json', createLocationSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const body = ctx.req.valid('json');

    const agency = await prisma.agency.findUnique({
      where: { id: body.agencyId },
    });

    if (!agency) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'agency',
        message: t('agency.api.error.not_found'),
      });
    }

    // Check if location already exists for this agency in this city
    const existing = await prisma.agencyLocation.findFirst({
      where: { agencyId: body.agencyId, cityId: body.cityId },
    });

    if (existing) {
      throw new AppError({
        code: 'http:bad_request',
        message: t('location.api.error.already_exists'),
      });
    }

    const location = await prisma.agencyLocation.create({
      data: body,
      include: {
        agency: { select: { id: true, name: true, slug: true } },
        city: { select: { id: true, name: true } },
      },
    });

    return ctx.json({ data: location }, 201);
  })
  .get('/:identifier', ...LocationRoutes.getLocation, validator('param', locationIdSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.valid('param');

    const location = await prisma.agencyLocation.findUnique({
      where: { id: identifier },
      include: {
        agency: { select: { id: true, name: true, slug: true } },
        city: { select: { id: true, name: true } },
        _count: { select: { members: true, trips: true, buses: true } },
      },
    });

    if (!location) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'location',
        message: t('location.api.error.not_found'),
      });
    }

    return ctx.json({ data: location }, 200);
  })
  .patch('/:identifier', ...LocationRoutes.updateLocation, validator('param', locationIdSchema), validator('json', updateLocationSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.valid('param');
    const body = ctx.req.valid('json');

    const location = await prisma.agencyLocation.findUnique({
      where: { id: identifier },
    });

    if (!location) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'location',
        message: t('location.api.error.not_found'),
      });
    }

    const updated = await prisma.agencyLocation.update({
      data: body,
      where: { id: identifier },
      include: {
        agency: { select: { id: true, name: true, slug: true } },
        city: { select: { id: true, name: true } },
      },
    });

    return ctx.json({ data: updated }, 200);
  })
  .delete('/:identifier', ...LocationRoutes.deleteLocation, validator('param', locationIdSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.valid('param');

    const location = await prisma.agencyLocation.findUnique({
      where: { id: identifier },
      include: { _count: { select: { members: true, trips: true, buses: true } } },
    });

    if (!location) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'location',
        message: t('location.api.error.not_found'),
      });
    }

    if (location._count.members > 0 || location._count.trips > 0 || location._count.buses > 0) {
      // Instead of deleting, just deactivate
      await prisma.agencyLocation.update({
        data: { status: 'INACTIVE' },
        where: { id: identifier },
      });
      return ctx.json({ message: t('location.api.success.deactivated') }, 200);
    }

    await prisma.agencyLocation.delete({
      where: { id: identifier },
    });

    return ctx.json({ message: t('location.api.success.deleted') }, 200);
  });

export default locationHandler;
