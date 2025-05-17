import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { pageview } from '@/shared/lib/gtag';
import { authConfig } from '@/shared/config/auth';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  if (request.nextUrl.pathname.startsWith('/api')) {
    requestHeaders.set('x-custom-header', 'api-request');
    
    const accessToken = request.cookies.get('accessToken');
    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken.value}`);
    }
  }

  if (request.nextUrl.pathname !== '/_next/static' && 
      request.nextUrl.pathname !== '/favicon.ico' &&
      !request.nextUrl.pathname.includes('.')) {
    pageview(request.nextUrl.pathname);
  }

  const hasAccessToken = request.cookies.has('accessToken');
  const currentPath = request.nextUrl.pathname;

  const isProtectedPage = authConfig.protectedPages.some(
    (path: string) => currentPath.startsWith(path)
  );
  const isAuthPage = authConfig.publicPages.some(
    (path: string) => currentPath.startsWith(path)
  );

  if (!hasAccessToken && isProtectedPage) {
    return NextResponse.redirect(new URL(authConfig.signInPage, request.url));
  }

  if (hasAccessToken && isAuthPage) {
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