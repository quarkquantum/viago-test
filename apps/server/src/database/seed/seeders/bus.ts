import { faker } from '@faker-js/faker';
import { prisma } from '@repo/database';
import { BusSeatPolicy, SeatType } from '@repo/shared';
import type { SeederResult } from '../core';
import { createTimer } from '../core';
import { randomElement, randomInt } from '../utils';

export function createBusesSeeder() {
  return async (): Promise<SeederResult> => {
    const timer = createTimer();
    const result: SeederResult = { success: 0, failed: 0, skipped: 0, durationMs: 0, errors: [] };

    const agencies = await prisma.agency.findMany();

    for (const agency of agencies) {
      const busCount = randomInt(2, 5);

      for (let i = 0; i < busCount; i++) {
        try {
          const maxPlaces = randomElement([25, 30, 35]);

          const bus = await prisma.bus.create({
            data: {
              agencyId: agency.id,
              licensePlate: `${faker.string.alpha({ casing: 'upper', length: 3 })}-${faker.number.int({ max: 999, min: 100 })}-${faker.string.alpha({ casing: 'upper', length: 2 })}`,
              maxPlaces,
              seatReservationType: randomElement(Object.values(BusSeatPolicy)),
              title: faker.vehicle.model(),
            },
          });

          for (let seatNum = 1; seatNum <= maxPlaces; seatNum++) {
            await prisma.seat.create({
              data: {
                number: seatNum,
                type: seatNum === 1 ? SeatType.DRIVER : SeatType.PASSENGER,
                busId: bus.id,
              },
            });
          }

          result.success++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            item: { agencyId: agency.id, index: i },
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    result.durationMs = timer.elapsed();
    return result;
  };
}
