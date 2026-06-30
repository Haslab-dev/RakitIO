import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { projects } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import type { Database } from '../db';

type ProjectsEnv = {
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

const projectsRoutes = new Hono<ProjectsEnv>();

projectsRoutes.use('/*', authMiddleware);

projectsRoutes.get('/', async (c) => {
  const db = c.get('db');
  const user = c.get('user');

  const userProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      boardId: projects.boardId,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      version: projects.version,
    })
    .from(projects)
    .where(eq(projects.userId, user.id));

  return c.json({ projects: userProjects });
});

projectsRoutes.get('/:id', async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const projectId = c.req.param('id');

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  return c.json({
    project: {
      ...project,
      data: JSON.parse(project.data),
    },
  });
});

projectsRoutes.post('/', async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const body = await c.req.json<{
    name: string;
    description?: string;
    boardId: string;
    data?: unknown;
  }>();

  if (!body.name || !body.boardId) {
    return c.json({ error: 'name and boardId are required' }, 400);
  }

  const now = new Date().toISOString();
  const projectId = generateId();

  await db.insert(projects).values({
    id: projectId,
    userId: user.id,
    name: body.name,
    description: body.description ?? '',
    boardId: body.boardId,
    data: JSON.stringify(body.data ?? {}),
    createdAt: now,
    updatedAt: now,
    version: 1,
  });

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return c.json({
    project: {
      ...project!,
      data: JSON.parse(project!.data),
    },
  }, 201);
});

projectsRoutes.put('/:id', async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const projectId = c.req.param('id');
  const body = await c.req.json<{
    name?: string;
    description?: string;
    boardId?: string;
    data?: unknown;
  }>();

  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const now = new Date().toISOString();

  await db
    .update(projects)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.boardId !== undefined && { boardId: body.boardId }),
      ...(body.data !== undefined && { data: JSON.stringify(body.data) }),
      updatedAt: now,
      version: existing.version + 1,
    })
    .where(eq(projects.id, projectId));

  const [updated] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return c.json({
    project: {
      ...updated!,
      data: JSON.parse(updated!.data),
    },
  });
});

projectsRoutes.delete('/:id', async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const projectId = c.req.param('id');

  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Project not found' }, 404);
  }

  await db.delete(projects).where(eq(projects.id, projectId));

  return c.json({ success: true });
});

export default projectsRoutes;
