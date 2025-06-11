import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken');

  if (pathname.startsWith('/api')) {
    requestHeaders.set('x-custom-header', 'api-request');
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (pathname.startsWith('/signup')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    } 
  }

  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${pathname}`, request.url));  
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