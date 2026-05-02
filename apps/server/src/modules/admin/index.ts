import { auth } from '@repo/auth/admin/server';
import { Hono } from 'hono';
import type { HonoEnv } from '../../lib/hono/context';
import AgencyHandler from './agencies/handlers';
import agencyManagerHandler from './agency-managers/handlers';
import agencyRequestHandler from './agency-requests/handlers';
import billingHandler from './billing/handlers';
import bookingHandler from './bookings/handlers';
import busHandler from './buses/handlers';
import CashierHandler from './cashiers/handlers';
import cityHandler from './cities/handlers';
import countryHandler from './countries/handlers';
import dashboardHandler from './dashboard/handlers';
import driverHandler from './drivers/handlers';
import locationHandler from './locations/handlers';
import passengerHandler from './passenger/handlers';
import revenueHandler from './revenues/handlers';
import ticketHandler from './tickets/handlers';
import tripHandler from './trips/handlers';
import userHandler from './users/handlers';

const adminModule = new Hono<HonoEnv>()
  // Handles all /auth/* routes
  .on(['POST', 'GET'], '/auth/*', async (c) => auth.handler(c.req.raw))
  .route('/dashboard', dashboardHandler)
  .route('/buses', busHandler)
  .route('/trips', tripHandler)
  .route('/drivers', driverHandler)
  .route('/bookings', bookingHandler)
  .route('/users', userHandler)
  .route('/agencies', AgencyHandler)
  .route('/agency-managers', agencyManagerHandler)
  .route('/agency-requests', agencyRequestHandler)
  .route('/billing', billingHandler)
  .route('/cities', cityHandler)
  .route('/countries', countryHandler)
  .route('/locations', locationHandler)
  .route('/cashiers', CashierHandler)
  .route('/passenger', passengerHandler)
  .route('/tickets', ticketHandler)
  .route('/revenues', revenueHandler);

export default adminModule;
