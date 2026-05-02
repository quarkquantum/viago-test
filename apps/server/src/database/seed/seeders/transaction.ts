import { faker } from '@faker-js/faker';
import type { Booking } from '@repo/database';
import { prisma } from '@repo/database';
import { TransactionStatus } from '@repo/shared';
import { Seeder } from '../core';

export function createTransactionsSeeder() {
  return async () => {
    const bookings = await prisma.booking.findMany();

    const seeder = new Seeder<Booking>({
      name: 'Transactions',
      data: bookings,
      batchSize: 20,
      progressInterval: 20,
      processor: async (booking, _index, prisma) => {
        await prisma.transaction.create({
          data: {
            reference: faker.string.alphanumeric(10).toUpperCase(),
            amount: Math.round(booking.total),
            currency: 'XAF',
            status: TransactionStatus.COMPLETE,
            agencyId: booking.agencyId,
            userId: booking.passengerId,
            bookingId: booking.id,
            createdAt: booking.createdAt,
            metadata: {
              paymentMethod: faker.helpers.arrayElement(['mobile_money', 'card', 'cash']),
              provider: faker.helpers.arrayElement(['MTN', 'Orange', 'Visa', 'Mastercard']),
            },
          },
        });
      },
    });

    return seeder.run();
  };
}
