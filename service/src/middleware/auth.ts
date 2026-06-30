import { createMiddleware } from 'hono/factory';
import { eq } from 'drizzle-orm';
import { sessions, users } from '../db/schema';
import type { Database } from '../db';

type AuthEnv = {
  Variables: {
    db: Database;
    user: {
      id: string;
      email: string;
      name: string;
      avatarUrl: string | null;
      createdAt: string;
      updatedAt: string;
    };
  };
};

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.slice(7);
  const db = c.get('db');
  const now = new Date().toISOString();

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session) {
    return c.json({ error: 'Invalid session token' }, 401);
  }

  if (session.expiresAt < now) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return c.json({ error: 'Session expired' }, 401);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  c.set('user', {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });

  await next();
});
