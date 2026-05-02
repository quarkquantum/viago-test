import { prisma } from '@repo/database';
import { TransactionStatus } from '@repo/shared/constants/transaction';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { z } from 'zod';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextUser } from '@/lib/hono/context';
import { notchpay } from '@/lib/notchpay';
import { InitPaymentRoutes } from './routes';

// Schema for initializing a payment
const initPaymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  callbackUrl: z.url('Invalid callback URL').optional(),
});

const initPaymentHandler = new Hono<HonoEnv>()
  /**
   * Initialize a payment for a booking
   */
  .post('/', ...InitPaymentRoutes.initPayment, validator('json', initPaymentSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const user = getContextUser();
    const { bookingId, callbackUrl } = ctx.req.valid('json');

    // Get booking details
    const booking = await prisma.booking.findUnique({
      include: {
        agency: true,
        fromStation: true,
        passenger: {
          include: {
            profile: true,
          },
        },
        toStation: true,
      },
      where: { id: bookingId },
    });

    if (!booking) {
      throw new AppError({
        code: 'http:not_found',
        entityType: 'booking',
        message: t('booking.api.error.not_found'),
      });
    }

    // Check if user owns this booking
    if (booking.passengerId !== user.id) {
      throw new AppError({
        code: 'http:forbidden',
        message: t('payment.api.error.unauthorized_pay'),
      });
    }

    // Check if booking already has a transaction
    const existingTransaction = await prisma.transaction.findUnique({
      where: { bookingId },
    });

    if (existingTransaction) {
      throw new AppError({
        code: 'http:bad_request',
        message: t('payment.api.error.already_initiated'),
      });
    }

    // Generate unique reference
    const reference = `VGO-${Date.now()}-${bookingId.slice(-6)}`;

    // Ensure minimum amount of 25 XAF (NotchPay requirement)
    const amount = Math.max(25, Math.round(booking.total));

    // Validate phone number format (NotchPay requires valid phone or omit)
    // Const phoneNumber = booking.passenger.profile?.phoneNumber;
    // Const isValidPhone = phoneNumber && /^\+?[0-9]{9,15}$/.test(phoneNumber.replace(/\s/g, ''));

    // Initialize payment with NotchPay SDK
    const paymentResponse = await notchpay.initPayment({
      amount,
      callback: callbackUrl,
      currency: 'XAF',
      customer: {
        email: booking.passenger.email,
        name: booking.passenger.fullName ?? booking.passenger.email.split('@')[0],
        // ...(phoneNumber && { phone: phoneNumber }),
      },
      description: `Ticket from ${booking.fromStation.name} to ${booking.toStation.name}`,
      metadata: {
        agencyId: booking.agencyId,
        bookingId: booking.id,
        userId: user.id,
      },
      reference,
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        agencyId: booking.agencyId,
        amount: Math.round(booking.total),
        bookingId: booking.id,
        currency: 'XAF',
        metadata: {
          notchpayTransactionId: paymentResponse.transaction?.reference,
        },
        reference,
        status: TransactionStatus.PENDING,
        userId: user.id,
      },
    });

    return ctx.json(
      {
        data: {
          authorizationUrl: paymentResponse.authorization_url,
          reference,
        },
        message: t('payment.api.success.initialized'),
      },
      200
    );
  })

  /**
   * Get payment status for a transaction
   */
  .get('/:reference', ...InitPaymentRoutes.getPaymentStatus, async (ctx) => {
    const t = await useTranslation(ctx);
    const user = getContextUser();
    const { reference } = ctx.req.param();

    const transaction = await prisma.transaction.findUnique({
      include: {
        booking: {
          include: {
            fromStation: true,
            toStation: true,
          },
        },
      },
      where: { reference },
    });

    if (!transaction) {
      throw new AppError({
        code: 'http:not_found',
        entityType: 'booking',
        message: t('payment.api.error.transaction_not_found'),
      });
    }

    // Check if user owns this transaction
    if (transaction.userId !== user.id) {
      throw new AppError({
        code: 'http:forbidden',
        message: t('payment.api.error.unauthorized_view'),
      });
    }

    return ctx.json({ data: transaction }, 200);
  });

export default initPaymentHandler;
