import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (typeof window === 'undefined') {
  prisma = new PrismaClient();
} else {
  throw new Error('PrismaClient is not supported in the browser.');
}

export default prisma;