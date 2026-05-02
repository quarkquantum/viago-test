import { auth } from '@repo/auth/agency/server';
import { Hono } from 'hono';
import type { HonoEnv } from '../../lib/hono/context';
import bookingHandler from './bookings/handlers';
import busHandler from './buses/handlers';
import citiesHandler from './cities/handlers';
import coreHandler from './core/handlers';
import dashboardHandler from './dashboard/handlers';
import driverHandler from './drivers/handlers';
import locationHandler from './locations/handlers';
import managerHandler from './agency-managers/handlers';
import cashierHandler from './cashier/handlers';
import meHandler from './me/handlers';
import passengerHandler from './passenger/handlers';
import pricingHandler from './pricing/handlers';
import requestHandler from './requests/handlers';
import tripHandler from './trips/handlers';

const agencyModule = new Hono<HonoEnv>()
  // Handles all /auth/* routes
  .on(['POST', 'GET'], '/auth/*', async (c) => auth.handler(c.req.raw))
  .route('/', coreHandler)
  .route('/buses', busHandler)
  .route('/trips', tripHandler)
  .route('/drivers', driverHandler)
  .route('/bookings', bookingHandler)
  .route('/me', meHandler)
  .route('/passengers', passengerHandler)
  .route('/cities', citiesHandler)
  .route('/locations', locationHandler)
  .route('/dashboard', dashboardHandler)
  .route('/requests', requestHandler)
  .route('/managers', managerHandler)
  .route('/cashiers', cashierHandler)
  .route('/pricing', pricingHandler);
// .route("/tickets", ticketHandler)
// .route("/stations", stationHandler);

export default agencyModule;
