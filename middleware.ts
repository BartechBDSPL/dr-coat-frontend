import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const path = request.nextUrl.pathname;

  if (path === '/login' || path === '/register') {
    if (token) {
      // Check if there's a return URL parameter
      const returnUrl = request.nextUrl.searchParams.get('r');
      if (returnUrl) {
        return NextResponse.redirect(new URL(returnUrl, request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    // Create login URL with return parameter including query string
    const loginUrl = new URL('/login', request.url);
    const fullPath = path + request.nextUrl.search;
    loginUrl.searchParams.set('r', fullPath);
    return NextResponse.redirect(loginUrl);
  }

  if (path === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico|manifest.json).*)',
  ],
};
