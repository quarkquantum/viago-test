import { prisma } from '@repo/database';
import { createSeedRunner } from './core';
import {
  createAlphaUsersSeeder,
  createAdminsSeeder,
  createAgenciesSeeder,
  createBookingsSeeder,
  createBusesSeeder,
  createCashiersSeeder,
  createCitiesSeeder,
  createCountriesSeeder,
  createDriversSeeder,
  createLanguagesSeeder,
  createRolesSeeder,
  createTicketsSeeder,
  createTransactionsSeeder,
  createTripsSeeder,
  createUsersSeeder,
} from './seeders';
import { clearDatabase } from './utils';

export async function seedDevelopment() {
  await clearDatabase(prisma);

  const runner = createSeedRunner();

  runner.registerAll([
    { name: 'Countries', shouldRun: true, executor: createCountriesSeeder() },
    { name: 'Cities', shouldRun: true, executor: createCitiesSeeder() },
    { name: 'Languages', shouldRun: true, executor: createLanguagesSeeder() },
    { name: 'Agency Roles', shouldRun: true, executor: createRolesSeeder() },
    { name: 'Users', shouldRun: true, executor: createUsersSeeder() },
    { name: 'Admins', shouldRun: true, executor: createAdminsSeeder() },
    { name: 'Alpha Users', shouldRun: true, executor: createAlphaUsersSeeder() },
    { name: 'Agencies', shouldRun: true, executor: createAgenciesSeeder() },
    { name: 'Cashiers', shouldRun: true, executor: createCashiersSeeder() },
    { name: 'Drivers', shouldRun: true, executor: createDriversSeeder() },
    { name: 'Buses & Seats', shouldRun: true, executor: createBusesSeeder() },
    { name: 'Trips & Stations', shouldRun: true, executor: createTripsSeeder() },
    { name: 'Bookings', shouldRun: true, executor: createBookingsSeeder() },
    { name: 'Transactions', shouldRun: true, executor: createTransactionsSeeder() },
    { name: 'Tickets', shouldRun: true, executor: createTicketsSeeder() },
  ]);

  await runner.run();
}
