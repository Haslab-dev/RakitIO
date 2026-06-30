import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { users, sessions } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
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

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  if (passwordHash.length !== hash.length) return false;
  let result = 0;
  for (let i = 0; i < passwordHash.length; i++) {
    result |= passwordHash.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return result === 0;
}

function createSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

const auth = new Hono<AuthEnv>();

auth.post('/register', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ email: string; password: string; name: string }>();

  if (!body.email || !body.password || !body.name) {
    return c.json({ error: 'email, password, and name are required' }, 400);
  }

  if (body.password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400);
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, body.email))
    .limit(1);

  if (existing) {
    return c.json({ error: 'Email already registered' }, 409);
  }

  const now = new Date().toISOString();
  const userId = generateId();
  const passwordHash = await hashPassword(body.password);

  await db.insert(users).values({
    id: userId,
    email: body.email,
    name: body.name,
    passwordHash,
    avatarUrl: null,
    createdAt: now,
    updatedAt: now,
  });

  const token = createSessionToken();
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    token,
    expiresAt,
    createdAt: now,
  });

  return c.json({
    token,
    user: {
      id: userId,
      email: body.email,
      name: body.name,
      avatarUrl: null,
      createdAt: now,
      updatedAt: now,
    },
  });
});

auth.post('/login', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ email: string; password: string }>();

  if (!body.email || !body.password) {
    return c.json({ error: 'email and password are required' }, 400);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, body.email))
    .limit(1);

  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const valid = await verifyPassword(body.password, user.passwordHash);
  if (!valid) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const token = createSessionToken();
  const sessionId = generateId();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    token,
    expiresAt,
    createdAt: now,
  });

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

auth.post('/logout', authMiddleware, async (c) => {
  const db = c.get('db');
  const authHeader = c.req.header('Authorization')!;
  const token = authHeader.slice(7);

  await db.delete(sessions).where(eq(sessions.token, token));

  return c.json({ success: true });
});

auth.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  return c.json({ user });
});

export default auth;
