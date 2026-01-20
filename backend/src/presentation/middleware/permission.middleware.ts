import { Context, Next } from 'hono';
import { ManagerRole } from '../../domain/enums/manager-role.enum.ts';

export async function requireStoryWrite(c: Context, next: Next) {
  const role = c.get('role') as string;

  if (role !== ManagerRole.ADMIN) {
    console.log({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message: 'Story write access denied',
      context: {
        managerId: c.get('managerId'),
        role,
      },
    });

    return c.json({ error: 'Forbidden', message: 'You do not have permission to modify stories' }, 403);
  }

  await next();
}

export async function requireStoryExport(c: Context, next: Next) {
  const role = c.get('role') as string;

  if (role !== ManagerRole.ADMIN) {
    console.log({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message: 'Story export access denied',
      context: {
        managerId: c.get('managerId'),
        role,
      },
    });

    return c.json({ error: 'Forbidden', message: 'You do not have permission to export stories' }, 403);
  }

  await next();
}

