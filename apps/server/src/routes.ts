import routes from './modules';
import baseApp from './server';

const app = baseApp.route('/api', routes);

export type AppType = typeof app;
export default app;
