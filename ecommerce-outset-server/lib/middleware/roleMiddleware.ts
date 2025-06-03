import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define role-based route access
const roleAccess = {
  admin: ['/admin', '/api/admin'],
  user: ['/dashboard', '/profile', '/api/user'],
  public: ['/auth', '/api/auth'],
};

export async function roleMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session_token')?.value;

  // If no session token, only allow access to public routes
  if (!sessionToken) {
    const isPublicRoute = roleAccess.public.some(path => pathname.startsWith(path));
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    // Get user's role from session
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const userRole = session.user.role;

    // Check if user has access to the requested route
    const hasAccess = roleAccess[userRole as keyof typeof roleAccess]?.some(path =>
      pathname.startsWith(path)
    );

    if (!hasAccess) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Role middleware error:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
} 