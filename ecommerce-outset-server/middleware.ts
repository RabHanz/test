import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that require authentication
const protectedPaths = [
  '/portal',
  '/dashboard',
  '/profile',
  '/settings',
];

// Add paths that are only accessible when not authenticated
const authPaths = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  // If trying to access protected path without auth
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // If trying to access auth pages while authenticated
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/portal', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 