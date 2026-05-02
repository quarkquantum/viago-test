import { defineIntlifyMiddleware, tryCookieLocale, tryHeaderLocale, tryQueryLocale } from '@intlify/hono';
import type { Context } from 'hono';
import enLocale from './translations/en.json' with { type: 'json' };
import frLocale from './translations/fr.json' with { type: 'json' };

type Locale = 'fr' | 'en';
type FRResourceSchema = typeof frLocale;
type ARResourceSchema = typeof enLocale;
type ResourceSchema = FRResourceSchema | ARResourceSchema;
declare module '@intlify/hono' {
  // please use `declare module '@intlifly/hono'`, if you want to use global resource schema in your project.
  export interface DefineLocaleMessage extends FRResourceSchema {}
}
export type I18nMiddlewareOptions = {
  defaultLocale?: Locale;
};

// define custom locale detector
function createLocaleDetector(defaultLocale: Locale = 'fr') {
  return (ctx: Context) => {
    const query = tryQueryLocale(ctx.req.raw);
    if (query) {
      return query.toString();
    }

    const cookie = tryCookieLocale(ctx.req.raw);
    if (cookie) {
      return cookie.toString();
    }

    const header = tryHeaderLocale(ctx.req.raw);
    if (header) {
      return header.toString();
    }

    return defaultLocale;
  };
}
export function createI18nMiddleware(options: I18nMiddlewareOptions = {}) {
  const { defaultLocale = 'fr' } = options;

  return defineIntlifyMiddleware<[ResourceSchema], Locale>({
    // detect locale with `accept-language` header
    locale: createLocaleDetector(defaultLocale),
    fallbackLocale: defaultLocale,
    // resource messages
    messages: {
      fr: frLocale as ResourceSchema,
      en: enLocale as ResourceSchema,
    },
  });
}
export const i18nMiddleware = createI18nMiddleware();
