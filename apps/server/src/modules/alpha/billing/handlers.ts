import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { SubscriptionStatus, TRIAL_DURATION_MONTHS } from '@repo/shared/constants';
import { billingQuerySchema, extendTrialSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { AlphaBillingRoutes } from './routes';

const alphaBillingHandler = new Hono<HonoEnv>().get(
  '/',
  ...AlphaBillingRoutes.listSubscriptions,
  validator('query', billingQuerySchema),
  async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { q, status } = query;

    const where: Prisma.AgencySubscriptionWhereInput = {
      ...(status && { status }),
      ...(q && {
        agency: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
          ],
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.agencySubscription.findMany({
        include: {
          agency: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              status: true,
              createdAt: true,
            },
          },
          _count: {
            select: { invoices: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        where,
      }),
      prisma.agencySubscription.count({ where }),
    ]);

    const now = new Date();

    const subscriptions = data.map((sub) => {
      const trialEnd = new Date(sub.trialEndDate);
      const isTrialExpired = now > trialEnd;
      const remainingDays = isTrialExpired
        ? 0
        : Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...sub,
        invoiceCount: sub._count.invoices,
        isTrialExpired,
        remainingDays,
        trialDurationMonths: TRIAL_DURATION_MONTHS,
      };
    });

    return ctx.json(
      {
        data: subscriptions,
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
  .patch(
    '/:id/suspend',
    ...AlphaBillingRoutes.suspendSubscription,
    async (ctx) => {
      const t = await useTranslation(ctx);
      const { id } = ctx.req.param();

      const subscription = await prisma.agencySubscription.findUnique({
        where: { id },
      });

      if (!subscription) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'subscription',
          message: t('billing.api.error.not_found'),
        });
      }

      if (subscription.status === SubscriptionStatus.CANCELLED) {
        throw new AppError({
          code: 'http:bad_request',
          message: t('billing.api.error.already_cancelled'),
        });
      }

      const updated = await prisma.agencySubscription.update({
        data: { status: SubscriptionStatus.CANCELLED },
        where: { id },
      });

      await prisma.agency.update({
        data: { status: 'SUSPENDED' },
        where: { id: subscription.agencyId },
      });

      return ctx.json({ data: updated, message: t('billing.api.success.suspended') }, 200);
    }
  )
  .patch(
    '/:id/reactivate',
    ...AlphaBillingRoutes.reactivateSubscription,
    async (ctx) => {
      const t = await useTranslation(ctx);
      const { id } = ctx.req.param();

      const subscription = await prisma.agencySubscription.findUnique({
        where: { id },
      });

      if (!subscription) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'subscription',
          message: t('billing.api.error.not_found'),
        });
      }

      const now = new Date();
      const isTrialExpired = now > subscription.trialEndDate;

      const newStatus = isTrialExpired ? SubscriptionStatus.EXPIRED : SubscriptionStatus.TRIAL;

      const updated = await prisma.agencySubscription.update({
        data: { status: newStatus },
        where: { id },
      });

      await prisma.agency.update({
        data: { status: 'ACTIVE' },
        where: { id: subscription.agencyId },
      });

      return ctx.json({ data: updated, message: t('billing.api.success.reactivated') }, 200);
    }
  )
  .patch(
    '/:id/extend-trial',
    ...AlphaBillingRoutes.extendTrial,
    validator('json', extendTrialSchema),
    async (ctx) => {
      const t = await useTranslation(ctx);
      const { id } = ctx.req.param();
      const { months } = ctx.req.valid('json');

      const subscription = await prisma.agencySubscription.findUnique({
        where: { id },
      });

      if (!subscription) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'subscription',
          message: t('billing.api.error.not_found'),
        });
      }

      const newTrialEndDate = new Date(subscription.trialEndDate);
      newTrialEndDate.setMonth(newTrialEndDate.getMonth() + (months || 1));

      const updated = await prisma.agencySubscription.update({
        data: {
          trialEndDate: newTrialEndDate,
          status: SubscriptionStatus.TRIAL,
        },
        where: { id },
      });

      return ctx.json({ data: updated, message: t('billing.api.success.trial_extended') }, 200);
    }
  );

export default alphaBillingHandler;