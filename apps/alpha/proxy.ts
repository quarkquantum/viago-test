import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { env } from './env';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);
const LOCALE_PATTERN = /^\/(en|fr)(\/|$)/;

async function getUserSession(request: NextRequest) {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/alpha/auth/get-session`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });
    if (!response.ok) {
      return;
    }

    const session = await response.json();
    return session?.user || undefined;
  } catch {
    return;
  }
}

export async function proxy(request: NextRequest) {
  // First handle i18n routing
  const intlResponse = intlMiddleware(request);

  // Get the locale from the pathname
  const localeMatch = request.nextUrl.pathname.match(LOCALE_PATTERN);
  const locale = localeMatch ? localeMatch[1] : 'fr';

  let pathnameWithoutLocale = request.nextUrl.pathname.replace(LOCALE_PATTERN, '');
  if (!pathnameWithoutLocale.startsWith('/')) {
    pathnameWithoutLocale = `/${pathnameWithoutLocale}`;
  }
  if (pathnameWithoutLocale.endsWith('/') && pathnameWithoutLocale !== '/') {
    pathnameWithoutLocale = pathnameWithoutLocale.slice(0, -1);
  }

  const session = await getUserSession(request);

  if (
    pathnameWithoutLocale === '/login' ||
    pathnameWithoutLocale === '/otp-verification' ||
    pathnameWithoutLocale === '/forgot-password' ||
    pathnameWithoutLocale === '/reset-password'
  ) {
    if (session) {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    return intlResponse;
  }

  if (!session) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|.*\\.(?:css|js|map|png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf)).*)'],
};
