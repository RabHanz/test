import * as bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';

async function deleteExistingUser(email: string) {
  try {
    await prisma.user.delete({
      where: { email },
    });
    console.log(`Existing user with email ${email} deleted.`);
  } catch (error) {
    console.error(`Error deleting user with email ${email}:`, error);
  }
}

async function registerTestUser() {
  const email = 'test@example.com';
  const plainPassword = 'password123';

  // Delete existing user if it exists
  await deleteExistingUser(email);

  // Hash the password
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  try {
    // Create the user in the database
    const user = await prisma.user.upsert({
      where: { email },
      update: { emailVerified: true, password: hashedPassword },
      create: {
        email,
        password: hashedPassword,
        name: 'Test User',
        role: 'user',
        emailVerified: true,
      },
    });

    console.log('User after upsert:', user);

    // Force update emailVerified to true after upsert
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    console.log('User after forced update:', updatedUser);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

registerTestUser();