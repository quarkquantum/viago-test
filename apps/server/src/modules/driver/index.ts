import { auth } from '@repo/auth/driver/server';
import { Hono } from 'hono';
import type { HonoEnv } from '../../lib/hono/context';
import userHandler from './me/handlers';
import notificationsHandler from './notifications/handlers';
import reportHandler from './report/handlers';
import ticketHandler from './ticket/handlers';
import tripHandler from './trip/handlers';

const app = new Hono<HonoEnv>()
  // Handles all /auth/* routes
  .on(['POST', 'GET'], '/auth/*', async (c) => auth.handler(c.req.raw))
  .route('/me', userHandler)
  .route('/trips', tripHandler)
  .route('/tickets', ticketHandler)
  .route('/notifications', notificationsHandler)
  .route('/reports', reportHandler);

export default app;
