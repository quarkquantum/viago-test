import { auth } from '@repo/auth/alpha/server';
import { Hono } from 'hono';
import type { HonoEnv } from '../../lib/hono/context';
import adminHandler from './admins/handlers';
import agencyHandler from './agencies/handlers';
import agencyManagerHandler from './agency-managers/handlers';
import alphaAgencyRequestHandler from './agency-requests/handlers';
import alphaBillingHandler from './billing/handlers';
import driverHandler from './drivers/handlers';
import statsHandler from './stats/handlers';
import alphaAgencyManagementHandler from './tenants/handlers';

const alphaModule = new Hono<HonoEnv>()
  // Handles all /auth/* routes
  .on(['POST', 'GET'], '/auth/*', async (c) => auth.handler(c.req.raw))
  .route('/admins', adminHandler)
  .route('/agencies', agencyHandler)
  .route('/agency-managers', agencyManagerHandler)
  .route('/agency-requests', alphaAgencyRequestHandler)
  .route('/agency-management', alphaAgencyManagementHandler)
  .route('/billing', alphaBillingHandler)
  .route('/drivers', driverHandler)
  .route('/stats', statsHandler);

export default alphaModule;
