import { auth } from '@repo/auth/app/server';
import { Hono } from 'hono';
import type { HonoEnv } from '@/lib/hono/context';
import agencyHandler from './agency/handlers';
import bookingHandler from './booking/handlers';
import busHandler from './bus/handlers';
import countriesHandler from './countries/handlers';
import feedbackHandler from './feedback/handlers';
import userHandler from './me/handlers';
import paymentHandler from './payments';
import reportHandler from './report/handlers';
import stationHandler from './station/handlers';
import ticketHandler from './ticket/handlers';
import tripsHandler from './trip/handlers';

const app = new Hono<HonoEnv>()
  // Handles all /auth/* routes
  .on(['POST', 'GET'], '/auth/*', async (c) => auth.handler(c.req.raw))
  .route('/trips', tripsHandler)
  .route('/booking', bookingHandler)
  .route('/station', stationHandler)
  .route('/me', userHandler)
  .route('/bus', busHandler)
  .route('/agency', agencyHandler)
  .route('/tickets', ticketHandler)
  .route('/payments', paymentHandler)
  .route('/reports', reportHandler)
  .route('/feedback', feedbackHandler)
  .route('/countries', countriesHandler);

export default app;
