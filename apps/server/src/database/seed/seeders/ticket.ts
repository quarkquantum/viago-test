import { randomUUID } from 'node:crypto';
import type { Booking } from '@repo/database';
import { prisma } from '@repo/database';
import { TicketStatus } from '@repo/shared';
import { Seeder } from '../core';
import { randomElement } from '../utils';

export function createTicketsSeeder() {
  return async () => {
    const bookings = await prisma.booking.findMany();

    const seeder = new Seeder<Booking>({
      name: 'Tickets',
      data: bookings,
      batchSize: 20,
      progressInterval: 20,
      processor: async (booking, _index, prisma) => {
        await prisma.ticket.create({
          data: {
            bookingId: booking.id,
            passengerId: booking.passengerId,
            seatId: booking.seatId,
            status: randomElement([TicketStatus.ISSUED, TicketStatus.REFUNDED, TicketStatus.CANCELLED]),
            key: randomUUID(),
          },
        });
      },
    });

    return seeder.run();
  };
}
