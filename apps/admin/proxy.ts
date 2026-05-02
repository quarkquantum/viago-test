import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);
const LOCALE_PATTERN = /^\/(en|fr)(\/|$)/;

// Read internal API URL from environment at runtime
const getInternalApiUrl = () => {
  return process.env.API_INTERNAL_URL || 'http://localhost:3000';
};

async function getUserSession(request: NextRequest) {
  const cookies = request.headers.get('cookie');
  console.log('[proxy] getUserSession - cookies:', cookies);
  const url = `${getInternalApiUrl()}/api/admin/auth/session`;
  console.log('[proxy] getUserSession - URL:', url);
  try {
    const response = await fetch(url, {
      headers: {
        cookie: cookies || '',
      },
      credentials: 'include',
    });
    console.log('[proxy] get-session response status:', response.status);
    const text = await response.text();
    console.log('[proxy] get-session response body:', text);
    if (!response.ok) {
      return;
    }

    const session = JSON.parse(text);
    console.log('[proxy] Session parsed:', session);
    return session?.user || undefined;
  } catch (e) {
    console.log('[proxy] Session error:', e);
    return;
  }
}

export async function proxy(request: NextRequest) {
  console.log('[proxy] Request:', request.nextUrl.pathname);
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

  console.log('[proxy] pathnameWithoutLocale:', pathnameWithoutLocale);

  const session = await getUserSession(request);

  console.log('[proxy] session result:', session);

  if (
    pathnameWithoutLocale === '/login' ||
    pathnameWithoutLocale === '/otp-verification' ||
    pathnameWithoutLocale === '/forgot-password' ||
    pathnameWithoutLocale === '/reset-password'
  ) {
    console.log('[proxy] Auth page, has session:', !!session);
    if (session) {
      console.log('[proxy] Redirecting to /', locale);
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    return intlResponse;
  }

  if (!session) {
    console.log('[proxy] No session, redirecting to login');
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|.*\\.(?:css|js|map|png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf)).*)'],
};
