import { Hono } from 'hono';
import type { HonoEnv } from '../lib/hono/context';
import adminModule from './admin';
import agencyModule from './agency';
import alphaModule from './alpha';
import appModule from './app';
import cashierModule from './cashier';
import driverModule from './driver';
import countriesHandler from './app/countries/handlers';

const app = new Hono<HonoEnv>();

const routes = app
  .route('/app', appModule)
  .route('/cashier', cashierModule)
  .route('/agency', agencyModule)
  .route('/admin', adminModule)
  .route('/alpha', alphaModule)
  .route('/driver', driverModule)
  .route('/countries', countriesHandler);

export type AppRoutes = typeof routes;

export default routes;
