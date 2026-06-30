import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { aiProviders } from '../db/schema';
import type { Database } from '../db';

type ProviderEnv = {
  Variables: {
    db: Database;
    user: { id: string; email: string; name: string; avatarUrl: string | null; createdAt: string; updatedAt: string };
  };
};

const providers = new Hono<ProviderEnv>();

providers.use('/*', authMiddleware);

providers.get('/', async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const rows = await db.select().from(aiProviders).where(eq(aiProviders.userId, user.id));
  return c.json(rows.map(r => ({ ...r, apiKey: '••••••' + r.apiKey.slice(-4) })));
});

providers.post('/', async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const body = await c.req.json<{ name: string; provider: string; baseUrl: string; apiKey: string; model: string }>();

  if (!body.name || !body.provider || !body.baseUrl || !body.apiKey || !body.model) {
    return c.json({ error: 'name, provider, baseUrl, apiKey, model are required' }, 400);
  }

  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const now = new Date().toISOString();

  const existing = await db.select().from(aiProviders).where(eq(aiProviders.userId, user.id));
  const isActive = existing.length === 0;

  await db.insert(aiProviders).values({
    id,
    userId: user.id,
    name: body.name,
    provider: body.provider,
    baseUrl: body.baseUrl,
    apiKey: body.apiKey,
    model: body.model,
    isActive,
    createdAt: now,
    updatedAt: now,
  });

  return c.json({ id, name: body.name, provider: body.provider, isActive });
});

providers.put('/:id', async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json<{ name?: string; provider?: string; baseUrl?: string; apiKey?: string; model?: string }>();

  const [existing] = await db.select().from(aiProviders).where(
    and(eq(aiProviders.id, id), eq(aiProviders.userId, user.id))
  );

  if (!existing) {
    return c.json({ error: 'Provider not found' }, 404);
  }

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (body.name) updates.name = body.name;
  if (body.provider) updates.provider = body.provider;
  if (body.baseUrl) updates.baseUrl = body.baseUrl;
  if (body.apiKey) updates.apiKey = body.apiKey;
  if (body.model) updates.model = body.model;

  await db.update(aiProviders).set(updates).where(eq(aiProviders.id, id));

  return c.json({ id, ...updates });
});

providers.delete('/:id', async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const id = c.req.param('id');

  const [existing] = await db.select().from(aiProviders).where(
    and(eq(aiProviders.id, id), eq(aiProviders.userId, user.id))
  );

  if (!existing) {
    return c.json({ error: 'Provider not found' }, 404);
  }

  await db.delete(aiProviders).where(eq(aiProviders.id, id));

  return c.json({ deleted: true });
});

providers.post('/:id/activate', async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const id = c.req.param('id');

  const [existing] = await db.select().from(aiProviders).where(
    and(eq(aiProviders.id, id), eq(aiProviders.userId, user.id))
  );

  if (!existing) {
    return c.json({ error: 'Provider not found' }, 404);
  }

  const all = await db.select().from(aiProviders).where(eq(aiProviders.userId, user.id));
  for (const p of all) {
    await db.update(aiProviders).set({ isActive: p.id === id }).where(eq(aiProviders.id, p.id));
  }

  return c.json({ id, isActive: true });
});

export default providers;
