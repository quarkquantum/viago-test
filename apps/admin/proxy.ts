import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);
const LOCALE_PATTERN = /^\/(en|fr)(\/|$)/;

// Use NEXT_PUBLIC_API_URL — available at build time in both server and edge runtime.
// API_INTERNAL_URL is only useful when there's a real internal network (e.g. Docker),
// on Vercel it would resolve to localhost which has nothing listening.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getUserSession(request: NextRequest) {
  const cookies = request.headers.get('cookie');
  const url = `${API_URL}/api/admin/auth/get-session`;
  console.log('[proxy] get-session URL:', url);
  console.log('[proxy] cookies forwarded:', cookies ? 'yes' : 'none');
  try {
    const response = await fetch(url, {
      headers: {
        cookie: cookies || '',
      },
      cache: 'no-store',
    });
    console.log('[proxy] get-session status:', response.status);
    const text = await response.text();
    console.log('[proxy] get-session body:', text);
    if (!response.ok) {
      return;
    }
    const session = JSON.parse(text);
    return session?.session || undefined;
  } catch (e) {
    console.log('[proxy] get-session error:', e);
    return;
  }
}

export async function proxy(request: NextRequest) {
  console.log('[proxy] Request:', request.nextUrl.pathname);
  const intlResponse = intlMiddleware(request);

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

  console.log('[proxy] session result:', !!session);

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
    console.log('[proxy] No session, redirecting to login');
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|.*\\.(?:css|js|map|png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf)).*)'],
};
