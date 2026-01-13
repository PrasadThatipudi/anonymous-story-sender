import { Context } from 'hono';
import { ZodError } from 'zod';

interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
}

export function errorHandler(err: Error, c: Context) {
  console.error({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    message: 'Unhandled error',
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  });

  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      error: 'Validation Error',
      message: 'Invalid request data',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    };
    return c.json(response, 400);
  }

  if (err.message.includes('Unauthorized') || err.message.includes('Invalid token')) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Authentication required or token invalid',
      },
      401
    );
  }

  if (err.message.includes('Forbidden')) {
    return c.json(
      {
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
      },
      403
    );
  }

  if (err.message.includes('Not found')) {
    return c.json(
      {
        error: 'Not Found',
        message: 'The requested resource was not found',
      },
      404
    );
  }

  return c.json(
    {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    },
    500
  );
}

