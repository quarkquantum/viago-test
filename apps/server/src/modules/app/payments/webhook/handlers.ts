import { prisma } from '@repo/database';
import { BookingStatus } from '@repo/shared/constants/booking';
import { TicketStatus } from '@repo/shared/constants/ticket';
import { TransactionStatus } from '@repo/shared/constants/transaction';
import { Hono } from 'hono';
import { useTranslation } from '@intlify/hono';
import type { HonoEnv } from '@/lib/hono/context';
import { WebhookRoutes } from './routes';

const webhookHandler = new Hono<HonoEnv>()
  /**
   * Callback endpoint for NotchPay payment redirect (user returns here after payment)
   */
  .get('/', ...WebhookRoutes.webhook, async (ctx) => {
    const t = await useTranslation(ctx);
    // NotchPay redirects with query params: ?reference=xxx&trxref=xxx&status=complete
    const reference = ctx.req.query('trxref') || ctx.req.query('notchpay_trxref');
    const status = ctx.req.query('status');

    if (!reference) {
      return ctx.json({ message: t('payment.api.error.missing_reference') }, 400);
    }

    // Find transaction by reference
    const transaction = await prisma.transaction.findUnique({
      include: {
        booking: {
          include: {
            passenger: true,
            seat: true,
          },
        },
      },
      where: { reference },
    });

    if (!transaction) {
      return ctx.json({ message: t('payment.api.error.transaction_not_found') }, 404);
    }

    // Map NotchPay status to our TransactionStatus
    let newStatus: string = transaction.status;
    switch (status) {
      case 'complete':
      case 'successful': {
        newStatus = TransactionStatus.COMPLETE;
        break;
      }
      case 'failed': {
        newStatus = TransactionStatus.FAILED;
        break;
      }
      case 'canceled':
      case 'cancelled': {
        newStatus = TransactionStatus.CANCELED;
        break;
      }
      case 'expired': {
        newStatus = TransactionStatus.EXPIRED;
        break;
      }
      case 'pending':
      case 'processing': {
        newStatus = TransactionStatus.PROCESSING;
        break;
      }
      default:
        newStatus = TransactionStatus.PENDING;
        break;
    }

    // Update transaction status
    await prisma.transaction.update({
      data: {
        metadata: {
          ...((transaction.metadata as object) || {}),
          lastWebhookStatus: status,
          lastWebhookAt: new Date().toISOString(),
        },
        status: newStatus,
      },
      where: { id: transaction.id },
    });

    // If payment is complete, update booking status and create ticket
    if (newStatus === TransactionStatus.COMPLETE && transaction.booking) {
      const booking = transaction.booking;

      // Check if ticket already exists for this booking
      const existingTicket = await prisma.ticket.findUnique({
        where: { bookingId: booking.id },
      });

      if (!existingTicket) {
        // Create ticket and update booking status in a transaction
        await prisma.$transaction([
          // Update booking status to CONFIRMED
          prisma.booking.update({
            data: { status: BookingStatus.CONFIRMED },
            where: { id: booking.id },
          }),
          // Create the ticket
          prisma.ticket.create({
            data: {
              bookingId: booking.id,
              passengerId: booking.passengerId,
              seatId: booking.seatId,
              status: TicketStatus.ISSUED,
              key: crypto.randomUUID(),
            },
          }),
        ]);
      }
    }

    return ctx.json({ message: t('payment.api.success.webhook_processed') }, 200);
  });

export default webhookHandler;
