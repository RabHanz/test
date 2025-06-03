import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that don't require authentication
const publicPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/google',
];

// Add paths that require authentication
const protectedPaths = [
  '/portal',
  '/dashboard',
  '/profile',
  '/settings',
];

// Add paths that are only accessible when not authenticated
const authPaths = ['/login', '/register', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware invoked for path:', pathname);

  // Allow requests to session and analytics APIs
  if (pathname.startsWith('/api/auth/session') || pathname.startsWith('/api/analytics/dashboard') || pathname.startsWith('/api/auth/regenerate')) {
    console.log('Middleware allowing access to:', pathname);
    return NextResponse.next();
  }

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Get the session token from cookies
  const sessionToken = request.cookies.get('session_token')?.value;

  // If the path is public, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If there's no session token and the path is not public, redirect to login
  if (!sessionToken) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  const token = request.cookies.get('auth_token');

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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};