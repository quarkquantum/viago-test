import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { languageDetector } from 'hono/language';
import { logger as honoLogger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { i18nMiddleware } from '@/i18n/middleware';
import type { HonoEnv } from '@/lib/hono/context';
import { isNoBot } from './is-no-bot';
import { observabilityMiddleware } from './observability';

const app = new Hono<HonoEnv>();

// Secure headers
app.use('*', secureHeaders());

// Bot detection
app.use('*', isNoBot);

// Get metrics and trace
app.use('*', observabilityMiddleware);

app.use('*', honoLogger());

// CORS
const corsOptions: Parameters<typeof cors>[0] = {
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
  credentials: true,
  exposeHeaders: ['Content-Length'],
  origin: (origin) => origin,
};

app.use('*', cors(corsOptions));

// CSRF protection
// App.use('*', csrf({ origin: WHITELIST_ORIGINS }));

// Compress with gzip
// Apply gzip compression only to GET requests
app.use('*', (c, next) => {
  if (c.req.method === 'GET') {
    return compress()(c, next);
  }
  return next();
});

app.use(
  '*',
  languageDetector({
    // Supported languages and fallback
    supportedLanguages: ['en', 'fr'],
    fallbackLanguage: 'fr',
    caches: false, // Set to false to disable caching
    convertDetectedLanguage: (lang) => lang.replace('_', '-'), // Normalize language codes
    // Debugging
    debug: process.env.NODE_ENV !== 'production',
  })
);
app.use('*', i18nMiddleware);
app.use(prettyJSON());
export default app;
