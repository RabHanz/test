import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { generateToken } from './token';

const prisma = new PrismaClient();

export interface SessionOptions {
  rememberMe?: boolean;
}

export async function createSession(userId: string, options: SessionOptions = {}) {
  const sessionToken = await generateToken();
  const expires = new Date(
    Date.now() + (options.rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000
  );

  const session = await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });

  // Set session cookie
  cookies().set('session_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
    path: '/',
  });

  return session;
}

export async function getSession(sessionToken: string) {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session || session.expires < new Date()) {
    return null;
  }

  return session;
}

export async function updateSession(sessionToken: string) {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
  });

  if (!session) {
    return null;
  }

  // Extend session expiration
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const updatedSession = await prisma.session.update({
    where: { sessionToken },
    data: { expires },
  });

  // Update session cookie
  cookies().set('session_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
    path: '/',
  });

  return updatedSession;
}

export async function deleteSession(sessionToken: string) {
  await prisma.session.delete({
    where: { sessionToken },
  });

  // Clear session cookie
  cookies().delete('session_token');
}

export async function refreshSession(sessionToken: string) {
  const session = await getSession(sessionToken);

  if (!session) {
    return null;
  }

  // If session is about to expire (less than 1 hour remaining)
  if (session.expires.getTime() - Date.now() < 60 * 60 * 1000) {
    return updateSession(sessionToken);
  }

  return session;
} 