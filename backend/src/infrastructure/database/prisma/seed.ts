import { getPrismaClient } from '../prisma.client.ts';
import { loadEnv, getEnv } from '../../../config/env.ts';
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10;

async function seed() {
  loadEnv();
  const prisma = getPrismaClient();
  const env = getEnv();

  // Skip seeding if bootstrap credentials not provided
  if (!env.BOOTSTRAP_ADMIN_EMAIL || !env.BOOTSTRAP_ADMIN_PASSWORD) {
    console.log('⏭️  Skipping bootstrap admin seed (credentials not provided)');
    console.log('ℹ️  Use manager invitation system to add new admins');
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(env.BOOTSTRAP_ADMIN_PASSWORD, BCRYPT_ROUNDS as any);

    // Check if manager with bootstrap email exists
    const existingManager = await prisma.manager.findUnique({
      where: { email: env.BOOTSTRAP_ADMIN_EMAIL },
    });

    if (existingManager) {
      // Update existing manager to ADMIN
      const updated = await prisma.manager.update({
        where: { email: env.BOOTSTRAP_ADMIN_EMAIL },
        data: {
          role: 'ADMIN',
          password: hashedPassword,
        },
      });
      console.log(`✅ Manager ${updated.email} updated to ADMIN role!`);
      console.log(`🔑 Role: ${updated.role}`);
    } else {
      // Create new admin (original behavior)
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

