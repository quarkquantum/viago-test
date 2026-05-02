import { faker } from '@faker-js/faker';
import { prisma } from '@repo/database';
import { BookingStatus, BusSeatPolicy, SeatType } from '@repo/shared';
import type { SeederResult } from '../core';
import { createTimer } from '../core';
import { randomElement, randomInt } from '../utils';

export function createBookingsSeeder() {
  return async (): Promise<SeederResult> => {
    const timer = createTimer();
    const result: SeederResult = { success: 0, failed: 0, skipped: 0, durationMs: 0, errors: [] };

    const trips = await prisma.trip.findMany();
    const users = await prisma.user.findMany();

    if (users.length === 0) {
      result.durationMs = timer.elapsed();
      return result;
    }

    for (const trip of trips) {
      try {
        const stations = await prisma.station.findMany({
          where: { tripId: trip.id },
          orderBy: { order: 'asc' },
        });

        const fullTrip = await prisma.trip.findUnique({
          where: { id: trip.id },
          include: { bus: true },
        });

        if (!fullTrip?.bus || stations.length < 2) {
          result.skipped++;
          continue;
        }

        const seats = await prisma.seat.findMany({
          where: { busId: fullTrip.busId, type: SeatType.PASSENGER },
        });

        const bookedSeatIds = new Set<string>();
        const bookingCount = randomInt(2, Math.min(5, seats.length));

        for (let i = 0; i < bookingCount; i++) {
          const fromStation = randomElement(stations.slice(0, -1));
          const toStations = stations.filter((s) => s.order > fromStation.order);
          const toStation = randomElement(toStations);
          const availableSeats = seats.filter((s) => !bookedSeatIds.has(s.id));

          let seat;
          if (fullTrip.bus.seatReservationType === BusSeatPolicy.UNNUMBERED) {
            seat = randomElement(availableSeats);
          } else {
            seat = availableSeats.sort((a, b) => a.number - b.number)[0];
          }

          if (!seat) break;

          bookedSeatIds.add(seat.id);

          const stationsInRange = stations.filter((s) => s.order >= fromStation.order && s.order <= toStation.order);
          const total = stationsInRange.reduce((sum, station) => sum + station.startingPrice, 0);

          await prisma.booking.create({
            data: {
              passengerId: randomElement(users).id,
              total,
              status: BookingStatus.CONFIRMED,
              tripId: fullTrip.id,
              seatId: seat.id,
              fromStationId: fromStation.id,
              toStationId: toStation.id,
              agencyId: fullTrip.agencyId,
              createdAt: faker.date.recent({ days: 30 }),
            },
          });

          result.success++;
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          item: { tripId: trip.id },
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    result.durationMs = timer.elapsed();
    return result;
  };
}
