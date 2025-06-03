import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { validateToken, createToken, clearAndRegenerateTokens } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session retrieved by getServerSession:', session);

    if (!session) {
      console.log('No session found, checking cookies...');
      const cookieStore = cookies();
      const sessionToken = cookieStore.get('session_token')?.value;

      console.log('Session token from cookies:', sessionToken);

      if (sessionToken) {
        const validatedToken = validateToken(sessionToken);
        console.log('Validated token:', validatedToken);
      }

      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { user: session.user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/auth/session:', error);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
}

export async function testEndpoint() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Test endpoint - Session retrieved by getServerSession:', session);
    return session
      ? { status: 200, body: session }
      : { status: 401, body: { error: 'No session found' } };
  } catch (error) {
    console.error('Test endpoint - Error in getServerSession:', error);
    return { status: 500, body: { error: 'Internal server error' } };
  }
}

export async function POST() {
  try {
    console.log('Clearing existing session tokens...');
    await prisma.session.deleteMany();
    console.log('All session tokens cleared.');

    // Example user for testing
    const user = {
      id: '1',
      role: 'ADMIN',
    };

    const token = await createToken(user);
    console.log('New token generated:', token);

    return NextResponse.json(
      { message: 'Session tokens cleared and new token generated.', token },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error clearing and regenerating tokens:', error);
    return NextResponse.json(
      { error: 'Failed to clear and regenerate tokens' },
      { status: 500 }
    );
  }
}

export async function regenerateToken() {
  try {
    console.log('Regenerating session tokens for testing...');

    // Example user for testing
    const user = {
      id: '1',
      role: 'ADMIN',
    };

    const token = await createToken(user);
    console.log('New token generated:', token);

    return NextResponse.json(
      { message: 'New token generated.', token },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error regenerating tokens:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate tokens' },
      { status: 500 }
    );
  }
}

export async function clearAndRegenerateTokensRoute() {
  try {
    const token = await clearAndRegenerateTokens();
    return NextResponse.json(
      { message: 'Session tokens cleared and new token generated.', token },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error clearing and regenerating tokens:', error);
    return NextResponse.json(
      { error: 'Failed to clear and regenerate tokens' },
      { status: 500 }
    );
  }
}