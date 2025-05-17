import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { pageview } from '@/lib/gtag';
import { authConfig } from '@/lib/config/auth';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  if (request.nextUrl.pathname.startsWith('/api')) {
    requestHeaders.set('x-custom-header', 'api-request');
  }

  if (request.nextUrl.pathname !== '/_next/static' && 
      request.nextUrl.pathname !== '/favicon.ico' &&
      !request.nextUrl.pathname.includes('.')) {
    pageview(request.nextUrl.pathname);
  }

  const isAuth = request.cookies.has('auth-token');
  const currentPath = request.nextUrl.pathname;

  const isProtectedPage = authConfig.protectedPages.some(
    (path) => currentPath.startsWith(path)
  );
  const isAuthPage = authConfig.publicPages.some(
    (path) => currentPath.startsWith(path)
  );

  if (!isAuth && isProtectedPage) {
    return NextResponse.redirect(new URL(authConfig.signInPage, request.url));
  }

  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 