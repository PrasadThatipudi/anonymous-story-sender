import { AuthService } from '../src/application/services/auth.service.ts';
import { ManagerRepository } from '../src/infrastructure/database/repositories/manager.repository.ts';
import { getPrismaClient } from '../src/infrastructure/database/prisma.client.ts';
import { loadEnv } from '../src/config/env.ts';

loadEnv();

async function createManager() {
  const email = prompt('Enter manager email:');
  const password = prompt('Enter manager password (min 8 characters):');

  if (!email || !password) {
    console.error('❌ Email and password are required');
    Deno.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters');
    Deno.exit(1);
  }

  try {
    const prisma = getPrismaClient();
    const managerRepo = new ManagerRepository(prisma);
    const authService = new AuthService(managerRepo);

    await authService.createManager({ email, password });

    console.log(`✅ Manager account created successfully!`);
    console.log(`📧 Email: ${email}`);
    console.log(`\n🔐 You can now log in with these credentials.`);

    Deno.exit(0);
  } catch (error) {
    console.error('❌ Error creating manager:', error instanceof Error ? error.message : error);
    Deno.exit(1);
  }
}

createManager();

