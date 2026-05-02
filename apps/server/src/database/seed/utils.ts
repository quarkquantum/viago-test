import type { PrismaClient } from '@repo/database';
import { logger } from '@repo/logger';

/**
 * Get a random element from an array
 */
export function randomElement<T>(array: T[]): T {
  // biome-ignore lint/style/noNonNullAssertion: we sure that it's not null
  return array[Math.floor(Math.random() * array.length)]!;
}

/**
 * Get multiple random elements from an array
 */
export function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Get a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random float between min and max
 */
export function randomFloat(min: number, max: number, decimals = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

/**
 * Delay execution for a specified number of milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clear all data from the database
 */
export async function clearDatabase(prisma: PrismaClient) {
  logger.info('🗑️  Clearing database...');

  // Delete in reverse order of dependencies
  await prisma.transaction.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.station.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.agencyMember.deleteMany();
  await prisma.agencyRole.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.twoFactor.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  logger.info('✅ Database cleared');
}

/**
 * Log seeding progress
 */
export function logProgress(message: string, count?: number) {
  if (count !== undefined) {
    logger.info(`📝 ${message}: ${count} records`);
  } else {
    logger.info(`📝 ${message}`);
  }
}
