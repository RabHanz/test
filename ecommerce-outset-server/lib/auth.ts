import { getServerSession } from 'next-auth/next';
import { authOptions } from './authOptions';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export { authOptions };

export async function getSession() {
  console.log('getSession - Retrieving session using getServerSession');
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  console.log('getCurrentUser - Session retrieved:', session);
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    console.log('requireAuth - Authentication required, no user found');
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    console.log('requireAdmin - Admin access required, user:', user);
    throw new Error('Admin access required');
  }
  return user;
}

export async function requirePermission(permission: string) {
  const user = await getCurrentUser();
  if (!user || !user.permissions?.includes(permission)) {
    console.log(`requirePermission - Permission ${permission} required, user:`, user);
    throw new Error(`Permission ${permission} required`);
  }
  return user;
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return !!user && user.role === 'admin';
}

export async function hasPermission(permission: string) {
  const user = await getCurrentUser();
  return !!user && !!user.permissions?.includes(permission);
}

export function validateToken(token) {
  try {
    console.log('Validating token:', token);
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    console.log('Token successfully validated:', decoded);
    return decoded;
  } catch (error) {
    console.error('Error validating token:', error);
    return null;
  }
}

export async function createToken(user) {
  try {
    console.log('Creating token for user:', user);
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Token created:', token);
    return token;
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
}

export async function clearAndRegenerateTokens() {
  try {
    console.log('Clearing existing session tokens...');
    await prisma.session.deleteMany();
    console.log('All session tokens cleared.');

    // Example user for testing
    const user = {
      id: '1',
      role: 'ADMIN',
    };

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '1h' }
    );
    console.log('New token generated:', token);

    return token;
  } catch (error) {
    console.error('Error clearing and regenerating tokens:', error);
    throw error;
  }
}