import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { locales, defaultLocale } from './lib/i18n/config';

function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname;
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameLocale) return pathnameLocale;

  const storedLocale = request.cookies.get('preferred-locale')?.value;
  if (storedLocale && locales.includes(storedLocale as any)) {
    return storedLocale;
  }

  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim())
      .find((lang) => locales.some((locale) => locale.startsWith(lang.slice(0, 2))));

    if (preferredLocale) {
      const matchedLocale = locales.find((locale) =>
        locale.startsWith(preferredLocale.slice(0, 2))
      );
      if (matchedLocale) return matchedLocale;
    }
  }

  return defaultLocale;
}

function isProtectedPath(pathname: string): boolean {
  return locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/core`) ||
      pathname.startsWith(`/${locale}/pods`)
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  if (isProtectedPath(pathname)) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const response = NextResponse.next();
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (list) => {
            list.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      });

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const locale = getLocale(request);
        const loginUrl = new URL(`/${locale}/auth/login`, request.url);
        return NextResponse.redirect(loginUrl);
      }

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
