import { faker } from '@faker-js/faker';
import { prisma } from '@repo/database';
import { StationStatus, SystemRoles, TripStatus } from '@repo/shared';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import type { SeederResult } from '../core';
import { createTimer } from '../core';
import { randomElement, randomElements, randomInt } from '../utils';

export function createTripsSeeder() {
  return async (): Promise<SeederResult> => {
    const timer = createTimer();
    const result: SeederResult = { success: 0, failed: 0, skipped: 0, durationMs: 0, errors: [] };

    const buses = await prisma.bus.findMany();
    const driverRole = await prisma.agencyRole.findUnique({ where: { name: SystemRoles.DRIVER } });
    const drivers = await prisma.agencyMember.findMany({
      where: { roleId: driverRole?.id },
    });
    const cities = await prisma.city.findMany();

    if (cities.length === 0) {
      result.durationMs = timer.elapsed();
      return result;
    }

    // Phase 1: ensure every driver gets at least one trip
    for (const driver of drivers) {
      const agencyBuses = buses.filter((b) => b.agencyId === driver.agencyId);
      if (agencyBuses.length === 0) {
        result.skipped++;
        continue;
      }

      try {
        const bus = randomElement(agencyBuses);
        const selectedCities = randomElements(cities, randomInt(2, 5));
        const departureDate = faker.date.between({
          from: new Date(),
          to: new Date(new Date().setHours(new Date().getHours() + 4)),
        });
        const departureTime = (order: number) => new Date(departureDate.getTime() + order * 60 * 60 * 1000);

        const tripName = `${selectedCities[0]?.name} to ${selectedCities.at(-1)?.name}`;
        const trip = await prisma.trip.create({
          data: {
            agencyId: bus.agencyId,
            arrivalTime: departureTime(selectedCities.length - 1),
            busId: bus.id,
            status: TripStatus.ONGOING,
            driverId: driver.id,
            name: tripName,
            slug: `${slugify(tripName, { lower: true })}-${nanoid(4)}`,
            departureTime: departureTime(0),
            description: `Route: ${selectedCities.map((c) => c.name).join(' → ')}`,
          },
        });

        for (let order = 0; order < selectedCities.length; order++) {
          await prisma.station.create({
            data: {
              departureTime: departureTime(order),
              name: selectedCities[order]?.name || '',
              order,
              startingPrice: randomInt(3000, 10_000),
              tripId: trip.id,
              cityId: selectedCities[order]?.id || '',
            },
          });
        }

        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          item: { driverId: driver.id },
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Phase 2: add more random trips for buses
    for (const bus of buses) {
      const agencyDrivers = drivers.filter((d) => d.agencyId === bus.agencyId);
      if (agencyDrivers.length === 0) {
        result.skipped++;
        continue;
      }

      const tripCount = randomInt(1, 3);

      for (let i = 0; i < tripCount; i++) {
        try {
          const selectedCities = randomElements(cities, randomInt(3, 5));
          const departureDate = faker.date.between({
            from: new Date(),
            to: new Date(new Date().setHours(new Date().getHours() + 2)),
          });
          const departureTime = (order: number) => new Date(departureDate.getTime() + order * 60 * 60 * 1000);
          const driver = randomElement(agencyDrivers);
          const tripName = `${selectedCities[0]?.name} to ${selectedCities.at(-1)?.name}`;

          const trip = await prisma.trip.create({
            data: {
              agencyId: bus.agencyId,
              arrivalTime: departureTime(selectedCities.length - 1),
              busId: bus.id,
              departureTime: departureTime(0),
              description: `Direct route with stops at: ${selectedCities.map((c) => c.name).join(' → ')}`,
              driverId: driver.id,
              name: tripName,
              slug: `${slugify(tripName, { lower: true })}-${nanoid(4)}`,
              status: randomElement([TripStatus.ONGOING, TripStatus.COMPLETED, TripStatus.DELETED]),
            },
          });

          for (let order = 0; order < selectedCities.length; order++) {
            await prisma.station.create({
              data: {
                departureTime: departureTime(order),
                name: selectedCities[order]?.name || '',
                order,
                startingPrice: randomInt(5, 20),
                status: StationStatus.PENDING,
                tripId: trip.id,
                cityId: selectedCities[order]?.id || '',
              },
            });
          }

          result.success++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            item: { busId: bus.id, index: i },
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    result.durationMs = timer.elapsed();
    return result;
  };
}
