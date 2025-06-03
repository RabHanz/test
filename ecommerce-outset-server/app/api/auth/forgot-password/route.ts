import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateToken, hashToken } from '@/lib/token';
import { sendEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user doesn't exist for security
      return NextResponse.json(
        { message: 'If an account exists, you will receive a password reset email.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const token = await generateToken();

    // Store reset token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: await hashToken(token),
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      },
    });

    // Send reset email
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      text: `Click the following link to reset your password: ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`,
      html: `
        <p>Click the following link to reset your password:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}">
          Reset Password
        </a>
      `,
    });

    return NextResponse.json(
      { message: 'If an account exists, you will receive a password reset email.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
} 