import { getPrismaClient } from '../prisma.client.ts';
import { loadEnv, getEnv } from '../../../config/env.ts';
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10;

async function seed() {
  loadEnv();
  const prisma = getPrismaClient();
  const env = getEnv();

  try {
    const managerCount = await prisma.manager.count();

    if (managerCount === 0) {
      console.log('No managers found. Creating bootstrap admin...');

      const hashedPassword = await bcrypt.hash(env.BOOTSTRAP_ADMIN_PASSWORD, BCRYPT_ROUNDS as any);

      const admin = await prisma.manager.create({
        data: {
          email: env.BOOTSTRAP_ADMIN_EMAIL,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });

      console.log(`✅ Bootstrap admin created successfully!`);
      console.log(`📧 Email: ${admin.email}`);
      console.log(`🔑 Role: ${admin.role}`);
    } else {
      console.log(`ℹ️  Managers already exist (${managerCount}). Skipping bootstrap admin creation.`);
    }
  } catch (error) {
    console.error('❌ Error during seed:', error instanceof Error ? error.message : error);
    throw error;
  }
}

seed()
  .catch((error) => {
    console.error(error);
    Deno.exit(1);
  });

