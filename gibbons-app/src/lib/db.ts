import { PrismaClient } from '@prisma/client';

// Évite les connexions multiples lors des hot-reloads en développement Next.js
// en réutilisant l'instance stockée sur globalThis.

const globalForPrisma = globalThis as unknown as {
  __prisma: PrismaClient | undefined;
};

export const db: PrismaClient =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = db;
}
