import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

let db: PrismaClient;

export function getDb() {
  if (!db) {
    db = globalThis.prisma ?? new PrismaClient();
    if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;
  }
  return db;
}

export default getDb();
