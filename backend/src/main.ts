import { Hono } from 'hono';
import { loadEnv, getEnv } from './config/env.ts';
import { loggerMiddleware } from './presentation/middleware/logger.middleware.ts';
import { corsMiddleware } from './presentation/middleware/cors.middleware.ts';
import { securityHeadersMiddleware } from './presentation/middleware/security.middleware.ts';
import { errorHandler } from './presentation/middleware/error.middleware.ts';
import storyRoutes from './presentation/routes/story.routes.ts';
import authRoutes from './presentation/routes/auth.routes.ts';
import managerRoutes from './presentation/routes/manager.routes.ts';

loadEnv();

const app = new Hono();

app.use('*', loggerMiddleware);
app.use('*', corsMiddleware);
app.use('*', securityHeadersMiddleware);

app.get('/', (c) => {
  return c.json({
    message: 'Anonymous Story Sender API',
    version: '1.0.0',
    status: 'healthy',
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.route('/api/stories', storyRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/manager', managerRoutes);

app.onError(errorHandler);

const env = getEnv();
const port = parseInt(env.PORT, 10);

console.log(`🚀 Server starting on port ${port}`);
console.log(`📝 Environment: ${env.DENO_ENV}`);
console.log(`🔗 API available at: http://localhost:${port}`);

Deno.serve({ port }, app.fetch);

