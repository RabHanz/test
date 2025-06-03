import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken, hashToken } from '@/lib/token';
import { sendEmail } from '@/lib/email';
import { registerSchema } from '@/lib/validations/auth';
import { validateRequest } from '@/lib/middleware/validationMiddleware';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Validate request body
    const validationError = await validateRequest(registerSchema)(request as any);
    if (validationError) {
      return validationError;
    }

    const { email, password, name } = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'user',
      },
    });

    // Generate verification token
    const token = await generateToken();

    // Store verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: await hashToken(token),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    await sendEmail({
      to: email,
      subject: 'Verify your email',
      text: `Click the following link to verify your email: ${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`,
      html: `
        <p>Click the following link to verify your email:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}">
          Verify Email
        </a>
      `,
    });

    return NextResponse.json(
      { message: 'Registration successful. Please check your email to verify your account.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
} 