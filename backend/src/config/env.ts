import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRY: z.string().default('24h'),
  GMAIL_USER: z.string().email('Valid GMAIL_USER email is required'),
  GMAIL_APP_PASSWORD: z.string().min(16, 'GMAIL_APP_PASSWORD must be at least 16 characters'),
  MANAGER_EMAILS: z.string().min(1, 'At least one MANAGER_EMAILS is required'),
  CORS_ORIGINS: z.string().min(1, 'CORS_ORIGINS is required'),
  PORT: z.string().default('8000'),
  DENO_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function loadEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  try {
    const env = {
      DATABASE_URL: Deno.env.get('DATABASE_URL'),
      JWT_SECRET: Deno.env.get('JWT_SECRET'),
      JWT_EXPIRY: Deno.env.get('JWT_EXPIRY') || '24h',
      GMAIL_USER: Deno.env.get('GMAIL_USER'),
      GMAIL_APP_PASSWORD: Deno.env.get('GMAIL_APP_PASSWORD'),
      MANAGER_EMAILS: Deno.env.get('MANAGER_EMAILS'),
      CORS_ORIGINS: Deno.env.get('CORS_ORIGINS'),
      PORT: Deno.env.get('PORT') || '8000',
      DENO_ENV: Deno.env.get('DENO_ENV') || 'development',
    };

    cachedEnv = envSchema.parse(env);
    return cachedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      Deno.exit(1);
    }
    throw error;
  }
}

export function getEnv(): Env {
  if (!cachedEnv) {
    throw new Error('Environment not loaded. Call loadEnv() first.');
  }
  return cachedEnv;
}

export function getManagerEmails(): string[] {
  const env = getEnv();
  return env.MANAGER_EMAILS.split(',').map((email) => email.trim());
}

export function getCorsOrigins(): string[] {
  const env = getEnv();
  return env.CORS_ORIGINS.split(',').map((origin) => origin.trim());
}

