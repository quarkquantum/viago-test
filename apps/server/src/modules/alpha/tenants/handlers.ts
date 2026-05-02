import { useTranslation } from '@intlify/hono';
import { prisma } from '@repo/database';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { z } from 'zod';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { AlphaAgencyManagementRoutes } from './routes';

const alphaAgencyManagementHandler = new Hono<HonoEnv>()
  .get('/', ...AlphaAgencyManagementRoutes.listAgencies, async (ctx) => {
    const query = ctx.req.query();
    const { skip, take } = getPagination(query);
    const { status, q } = query;

    const where: Record<string, unknown> = {
      ...(status && { status }),
      ...(q && {
        OR: [{ name: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.agency.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          countryCode: true,
          createdAt: true,
        },
      }),
      prisma.agency.count({ where }),
    ]);

    return ctx.json(
      {
        data,
        pagination: getPaginationMeta({
          limit: Number.parseInt(query.limit || '20', 10),
          page: Number.parseInt(query.page || '1', 10),
          total,
        }),
      },
      200
    );
  })

  .get(
    '/:identifier',
    ...AlphaAgencyManagementRoutes.getAgency,
    validator('param', z.object({ identifier: z.string() })),
    async (ctx) => {
      const t = await useTranslation(ctx);
      const { identifier } = ctx.req.valid('param');

      const agency = await prisma.agency.findFirst({
        where: {
          OR: [{ id: identifier }, { slug: identifier }],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          description: true,
          countryCode: true,
          createdAt: true,
          owner: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          locations: {
            select: {
              id: true,
              name: true,
              cityId: true,
            },
          },
        },
      });

      if (!agency) {
        throw new AppError({
          code: 'agency:not_found',
          entityType: 'agency',
          message: t('agency.api.error.not_found'),
        });
      }

      return ctx.json({ data: agency }, 200);
    }
  )

  .patch(
    '/:identifier/suspend',
    ...AlphaAgencyManagementRoutes.suspendAgency,
    validator('param', z.object({ identifier: z.string() })),
    validator('json', z.object({ reason: z.string() })),
    async (ctx) => {
      const t = await useTranslation(ctx);
      const { identifier } = ctx.req.valid('param');

      const agency = await prisma.agency.findFirst({
        where: {
          OR: [{ id: identifier }, { slug: identifier }],
        },
      });

      if (!agency) {
        throw new AppError({
          code: 'agency:not_found',
          message: t('agency.api.error.not_found'),
        });
      }

      await prisma.agency.update({
        where: { id: agency.id },
        data: { status: 'SUSPENDED' },
      });

      return ctx.json(
        {
          message: t('agency.api.success.suspended'),
        },
        200
      );
    }
  )

  .patch(
    '/:identifier/reactivate',
    ...AlphaAgencyManagementRoutes.reactivateAgency,
    validator('param', z.object({ identifier: z.string() })),
    async (ctx) => {
      const t = await useTranslation(ctx);
      const { identifier } = ctx.req.valid('param');

      const agency = await prisma.agency.findFirst({
        where: {
          OR: [{ id: identifier }, { slug: identifier }],
        },
      });

      if (!agency) {
        throw new AppError({
          code: 'agency:not_found',
          message: t('agency.api.error.not_found'),
        });
      }

      await prisma.agency.update({
        where: { id: agency.id },
        data: { status: 'ACTIVE' },
      });

      return ctx.json(
        {
          message: t('agency.api.success.reactivated'),
        },
        200
      );
    }
  )

  .delete(
    '/:identifier',
    ...AlphaAgencyManagementRoutes.deleteAgency,
    validator('param', z.object({ identifier: z.string() })),
    async (ctx) => {
      const t = await useTranslation(ctx);
      const { identifier } = ctx.req.valid('param');

      const agency = await prisma.agency.findFirst({
        where: {
          OR: [{ id: identifier }, { slug: identifier }],
        },
      });

      if (!agency) {
        throw new AppError({
          code: 'agency:not_found',
          message: t('agency.api.error.not_found'),
        });
      }

      await prisma.agency.update({
        where: { id: agency.id },
        data: { status: 'DELETED' },
      });

      return ctx.json(
        {
          message: t('agency.api.success.deleted'),
        },
        200
      );
    }
  );

export default alphaAgencyManagementHandler;
