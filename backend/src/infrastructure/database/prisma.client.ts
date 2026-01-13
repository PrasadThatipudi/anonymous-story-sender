import { PrismaClient } from '@prisma/client';
import { getEnv } from '../../config/env.ts';

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    const env = getEnv();
    
    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: env.DATABASE_URL,
        },
      },
      log: env.DENO_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    console.log('✅ Prisma Client initialized');
  }

  return prismaInstance;
}

export async function disconnectPrisma(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
    console.log('👋 Prisma Client disconnected');
  }
}

