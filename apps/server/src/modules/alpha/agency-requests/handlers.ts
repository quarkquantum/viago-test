import { useTranslation } from '@intlify/hono';
import { auth } from '@repo/auth/alpha/server';
import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { agencyRequestIdSchema, listAgencyRequestsSchema, updateAgencyRequestSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { acceptAgencyRequest, rejectAgencyRequest } from '@/modules/shared/agency-requests/review-service';
import { AlphaAgencyRequestRoutes } from './routes';

const alphaAgencyRequestHandler = new Hono<HonoEnv>()
  .get('/', ...AlphaAgencyRequestRoutes.listRequests, validator('query', listAgencyRequestsSchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { sortBy, sortOrder, q, status } = query;

    const where: Prisma.AgencyRequestWhereInput = {
      ...(status && { status }),
      ...(q && {
        OR: [
          { agencyName: { contains: q, mode: 'insensitive' } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.agencyRequest.findMany({
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
        where,
      }),
      prisma.agencyRequest.count({ where }),
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

  .get(
    '/:identifier',
    ...AlphaAgencyRequestRoutes.getRequest,
    validator('param', agencyRequestIdSchema),
    async (ctx) => {
      const t = await useTranslation(ctx);
      const { identifier } = ctx.req.valid('param');

      const agencyRequest = await prisma.agencyRequest.findUnique({
        where: { id: identifier },
      });

      if (!agencyRequest) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'agencyRequest',
          message: t('agencyRequest.api.error.not_found'),
        });
      }

      return ctx.json({ data: agencyRequest }, 200);
    }
  )

  .patch(
    '/:identifier/approve',
    ...AlphaAgencyRequestRoutes.approveRequest,
    validator('param', agencyRequestIdSchema),
    async (ctx) => {
      console.log('[APPROVE] Starting approve flow', { identifier: ctx.req.param('identifier') });
      const t = await useTranslation(ctx);
      const { identifier } = ctx.req.valid('param');
      console.log('[APPROVE] Identifier validated', { identifier });
      const user = ctx.get('user');
      const session = ctx.get('session');
      console.log('[APPROVE] User and session', { userId: user?.id, sessionUserId: session?.userId });

      try {
        const newAgency = await acceptAgencyRequest({
          authApi: auth.api,
          headers: ctx.req.raw.headers,
          identifier,
          approverId: user?.id || session?.userId,
          origin: ctx.req.header('origin'),
          t,
        });
        console.log('[APPROVE] Success', { agencyId: newAgency?.id });

        return ctx.json(
          {
            data: newAgency,
            message: t('agencyRequest.api.success.approved'),
          },
          200
        );
      } catch (err) {
        console.log('[APPROVE] Error', { error: err?.message, stack: err?.stack, cause: err?.cause });
        console.log('[APPROVE] Full error', err);
        throw err;
      }
    }
  )

  .patch(
    '/:identifier/reject',
    ...AlphaAgencyRequestRoutes.rejectRequest,
    validator('param', agencyRequestIdSchema),
    validator('json', updateAgencyRequestSchema),
    async (ctx) => {
      const t = await useTranslation(ctx);
      const { identifier } = ctx.req.valid('param');
      const { rejectionReason } = ctx.req.valid('json');

      const updated = await rejectAgencyRequest({ identifier, rejectionReason, t });

      return ctx.json(
        {
          data: updated,
          message: t('agencyRequest.api.success.rejected'),
        },
        200
      );
    }
  );

export default alphaAgencyRequestHandler;
