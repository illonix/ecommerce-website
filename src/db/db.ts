// db.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Only create a new PrismaClient if it doesn't already exist
const db = globalThis.prisma ?? new PrismaClient();

// In dev, attach PrismaClient to globalThis to prevent multiple instances during HMR
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}

export default db;
