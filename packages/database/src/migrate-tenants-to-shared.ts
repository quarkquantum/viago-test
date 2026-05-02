/**
 * Migration script to consolidate tenant databases into the shared database.
 *
 * This script:
 * 1. Reads all tenant records from the main database
 * 2. For each tenant, connects to its database
 * 3. Migrates data to the main database using agency_id for separation
 * 4. Handles unique constraints and relationship preservation
 *
 * @deprecated Use this only once to migrate existing tenant data.
 * New agencies will use the shared database directly.
 */

import { prisma } from './index';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

interface MigrationStats {
  tenantsProcessed: number;
  agenciesMigrated: number;
  recordsMigrated: {
    agencies: number;
    locations: number;
    members: number;
    roles: number;
    trips: number;
    buses: number;
    bookings: number;
    tickets: number;
    seats: number;
    transactions: number;
    notifications: number;
    reports: number;
    feedback: number;
    subscriptions: number;
    invoices: number;
  };
  errors: string[];
}

async function getTenantDatabases(): Promise<Array<{ id: string; databaseName: string; agencyId?: string }>> {
  const tenants = await prisma.tenant.findMany({
    where: {
      status: 'ACTIVE',
      databaseName: { not: null },
    },
    select: {
      id: true,
      databaseName: true,
      agency: {
        select: { id: true },
      },
    },
  });

  return tenants.map((t) => ({
    id: t.id,
    databaseName: t.databaseName!,
    agencyId: t.agency?.id,
  }));
}

async function connectToTenantDb(databaseName: string): Promise<PrismaClient> {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error('POSTGRES_URL environment variable is not set');
  }
  const tenantConnectionString = connectionString.replace(/\/[^/]+$/, `/${databaseName}`);

  const { PrismaPg } = await import('@prisma/adapter-pg');
  const adapter = new PrismaPg({ connectionString: tenantConnectionString });
  return new PrismaClient({ adapter });
}

async function migrateAgencyData(
  tenantDb: PrismaClient,
  mainDb: typeof prisma,
  tenant: { id: string; databaseName: string; agencyId?: string },
  stats: MigrationStats
): Promise<void> {
  // Check if agency already exists in main db
  if (tenant.agencyId) {
    const existingAgency = await mainDb.agency.findUnique({
      where: { id: tenant.agencyId },
    });

    if (existingAgency) {
      console.log(`Agency ${existingAgency.id} already exists in main database, skipping...`);
      return;
    }
  }

  // Get agency from tenant database
  const agencies = await tenantDb.agency.findMany();
  for (const agency of agencies) {
    // Create agency in main database
    const { id, ...agencyData } = agency;
    const newAgency = await mainDb.agency.create({
      data: {
        ...agencyData,
        id, // Keep same ID
      },
    });
    stats.recordsMigrated.agencies++;

    // Migrate related data
    await migrateRelatedData(tenantDb, mainDb, newAgency.id, stats);
  }
}

async function migrateRelatedData(
  tenantDb: PrismaClient,
  mainDb: typeof prisma,
  agencyId: string,
  stats: MigrationStats
): Promise<void> {
  // Migrate locations
  const locations = await tenantDb.agencyLocation.findMany({
    where: { agencyId },
  });
  for (const location of locations) {
    const { id, ...locationData } = location;
    await mainDb.agencyLocation.create({
      data: {
        ...locationData,
        id,
        agency: { connect: { id: agencyId } },
      },
    });
    stats.recordsMigrated.locations++;
  }

  // Migrate roles
  const roles = await tenantDb.agencyRole.findMany({
    where: { agencyId },
  });
  for (const role of roles) {
    const { id, ...roleData } = role;
    await mainDb.agencyRole.create({
      data: {
        ...roleData,
        id,
      },
    });
    stats.recordsMigrated.roles++;
  }

  // Migrate members
  const members = await tenantDb.agencyMember.findMany({
    where: { agencyId },
  });
  for (const member of members) {
    const { id, ...memberData } = member;
    await mainDb.agencyMember.create({
      data: {
        ...memberData,
        id,
        agency: { connect: { id: agencyId } },
      },
    });
    stats.recordsMigrated.members++;
  }

  // Migrate buses
  const buses = await tenantDb.bus.findMany({
    where: { agencyId },
  });
  for (const bus of buses) {
    const { id, ...busData } = bus;
    await mainDb.bus.create({
      data: {
        ...busData,
        id,
        agency: { connect: { id: agencyId } },
      },
    });
    stats.recordsMigrated.buses++;
  }

  // Migrate trips
  const trips = await tenantDb.trip.findMany({
    where: { agencyId },
  });
  for (const trip of trips) {
    const { id, ...tripData } = trip;
    await mainDb.trip.create({
      data: {
        ...tripData,
        id,
        agency: { connect: { id: agencyId } },
      },
    });
    stats.recordsMigrated.trips++;
  }

  // Migrate bookings
  const bookings = await tenantDb.booking.findMany({
    where: { agencyId },
  });
  for (const booking of bookings) {
    const { id, ...bookingData } = booking;
    await mainDb.booking.create({
      data: {
        ...bookingData,
        id,
        agency: { connect: { id: agencyId } },
      },
    });
    stats.recordsMigrated.bookings++;
  }

  // Migrate tickets
  const tickets = await tenantDb.ticket.findMany({
    where: { agencyId },
  });
  for (const ticket of tickets) {
    const { id, ...ticketData } = ticket;
    await mainDb.ticket.create({
      data: {
        ...ticketData,
        id,
      },
    });
    stats.recordsMigrated.tickets++;
  }

  // Migrate seats
  const seats = await tenantDb.seat.findMany({
    where: { bus: { agencyId } },
  });
  for (const seat of seats) {
    const { id, ...seatData } = seat;
    await mainDb.seat.create({
      data: {
        ...seatData,
        id,
      },
    });
    stats.recordsMigrated.seats++;
  }

  // Migrate transactions
  const transactions = await tenantDb.transaction.findMany({
    where: { agencyId },
  });
  for (const transaction of transactions) {
    const { id, ...transactionData } = transaction;
    await mainDb.transaction.create({
      data: {
        ...transactionData,
        id,
        agency: { connect: { id: agencyId } },
      },
    });
    stats.recordsMigrated.transactions++;
  }

  // Migrate notifications
  const notifications = await tenantDb.notification.findMany({
    where: { agencyId },
  });
  for (const notification of notifications) {
    const { id, ...notificationData } = notification;
    await mainDb.notification.create({
      data: {
        ...notificationData,
        id,
        agency: { connect: { id: agencyId } },
      },
    });
    stats.recordsMigrated.notifications++;
  }

  // Migrate reports
  const reports = await tenantDb.report.findMany({
    where: { agencyId },
  });
  for (const report of reports) {
    const { id, ...reportData } = report;
    await mainDb.report.create({
      data: {
        ...reportData,
        id,
        agency: { connect: { id: agencyId } },
      },
    });
    stats.recordsMigrated.reports++;
  }

  // Migrate feedback
  const feedback = await tenantDb.feedback.findMany({
    where: { agencyId },
  });
  for (const item of feedback) {
    const { id, ...feedbackData } = item;
    await mainDb.feedback.create({
      data: {
        ...feedbackData,
        id,
        agency: { connect: { id: agencyId } },
      },
    });
    stats.recordsMigrated.feedback++;
  }

  // Migrate subscriptions
  const subscriptions = await tenantDb.agencySubscription.findMany({
    where: { agencyId },
  });
  for (const subscription of subscriptions) {
    const { id, ...subscriptionData } = subscription;
    await mainDb.agencySubscription.create({
      data: {
        ...subscriptionData,
        id,
        agency: { connect: { id: agencyId } },
      },
    });
    stats.recordsMigrated.subscriptions++;
  }

  // Migrate invoices
  const invoices = await tenantDb.invoice.findMany({
    where: { subscription: { agencyId } },
  });
  for (const invoice of invoices) {
    const { id, ...invoiceData } = invoice;
    await mainDb.invoice.create({
      data: {
        ...invoiceData,
        id,
      },
    });
    stats.recordsMigrated.invoices++;
  }
}

export async function migrateTenantsToShared(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    tenantsProcessed: 0,
    agenciesMigrated: 0,
    recordsMigrated: {
      agencies: 0,
      locations: 0,
      members: 0,
      roles: 0,
      trips: 0,
      buses: 0,
      bookings: 0,
      tickets: 0,
      seats: 0,
      transactions: 0,
      notifications: 0,
      reports: 0,
      feedback: 0,
      subscriptions: 0,
      invoices: 0,
    },
    errors: [],
  };

  console.log('Starting migration of tenant databases to shared database...');

  const tenants = await getTenantDatabases();
  console.log(`Found ${tenants.length} active tenant databases to migrate`);

  for (const tenant of tenants) {
    console.log(`Processing tenant ${tenant.id} (database: ${tenant.databaseName})...`);

    try {
      const tenantDb = await connectToTenantDb(tenant.databaseName);
      await migrateAgencyData(tenantDb, prisma, tenant, stats);
      await tenantDb.$disconnect();

      // Update tenant status to MIGRATED
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { status: 'DELETED' }, // Using DELETED to indicate it's no longer active
      });

      stats.tenantsProcessed++;
      console.log(`✓ Completed tenant ${tenant.id}`);
    } catch (error: any) {
      const errorMsg = `Failed to migrate tenant ${tenant.id}: ${error.message}`;
      console.error(errorMsg);
      stats.errors.push(errorMsg);
    }
  }

  console.log('\nMigration completed!');
  console.log(`Tenants processed: ${stats.tenantsProcessed}`);
  console.log('Records migrated:', stats.recordsMigrated);
  if (stats.errors.length > 0) {
    console.log('Errors:', stats.errors);
  }

  return stats;
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateTenantsToShared()
    .then((stats) => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
