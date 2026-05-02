import { auth } from '@repo/auth/cashier/server';
import { Hono } from 'hono';
import type { HonoEnv } from '../../lib/hono/context';
import agencyHandler from './agencies/handlers';
import dashboardHandler from './dashboard/handlers';
import locationHandler from './location/handlers';
import meHandler from './me/handlers';
import passengerHandler from './passenger/handlers';
import stationHandler from './station/handlers';
import ticketHandler from './tickets/handlers';
import tripHandler from './trips/handlers';

const app = new Hono<HonoEnv>()
  // Handles all /auth/* routes
  .on(['POST', 'GET'], '/auth/*', async (c) => auth.handler(c.req.raw))
  .route('/tickets', ticketHandler)
  .route('/agencies', agencyHandler)
  .route('/passengers', passengerHandler)
  .route('/me', meHandler)
  .route('/trips', tripHandler)
  .route('/dashboard', dashboardHandler)
  .route('/stations', stationHandler)
  .route('/locations', locationHandler);

export default app;
