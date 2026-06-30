import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createDb } from './db';
import auth from './routes/auth';
import projectsRoutes from './routes/projects';
import ai from './routes/ai';
import type { Database } from './db';

type AppEnv = {
  Bindings: {
    TURSO_URL: string;
    TURSO_AUTH_TOKEN: string;
    AI_API_KEY: string;
    AI_BASE_URL: string;
    AI_MODEL: string;
  };
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

const app = new Hono<AppEnv>();

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/*', async (c, next) => {
  const db = createDb(c.env.TURSO_URL, c.env.TURSO_AUTH_TOKEN);
  c.set('db', db);
  await next();
});

app.get('/', (c) => {
  return c.json({
    name: '@rakit-io/worker',
    version: '1.0.0',
    status: 'ok',
  });
});

app.route('/auth', auth);
app.route('/projects', projectsRoutes);
app.route('/ai', ai);

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
