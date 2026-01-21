import { PrismaClient } from './generated/client/deno/edge.ts';
import { withAccelerate } from '@prisma/extension-accelerate';
import { getEnv } from '../../config/env.ts';

let prismaInstance: any = null;

export function getPrismaClient() {
  if (!prismaInstance) {
    const env = getEnv();
    
    const client = new PrismaClient({
      datasources: {
        db: {
          url: env.DATABASE_URL, // Accelerate URL
        },
      },
      log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Extend with Accelerate for edge runtime support
    prismaInstance = client.$extends(withAccelerate());

    console.log('✅ Prisma Client initialized with Accelerate');
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
