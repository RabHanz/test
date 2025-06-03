import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { generateToken } from '@/lib/token';

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name) {
      return NextResponse.json(
        { error: 'Invalid token or missing required fields' },
        { status: 401 }
      );
    }

    const { email, name, picture } = payload;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          image: picture || null,
          role: 'user',
          emailVerified: new Date(),
        },
      });
    }

    // Generate session token
    const sessionToken = await generateToken();

    // Create session
    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Remove sensitive data
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        user: userWithoutPassword,
        token: sessionToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 