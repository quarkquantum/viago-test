import { Hono } from 'hono';
import type { HonoEnv } from '@/lib/hono/context';
import initPaymentHandler from './init/handlers';
import webhookHandler from './webhook/handlers';

const paymentHandler = new Hono<HonoEnv>().route('/init', initPaymentHandler).route('/webhook', webhookHandler);

export default paymentHandler;
