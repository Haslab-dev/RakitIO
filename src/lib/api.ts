import { eq, and } from 'drizzle-orm';
import { db, schema } from './db';
import { users, sessions, aiProviders, projects } from './db/schema';
import type { Project } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface NormalizedWire {
  id: string;
  from: { componentId: string; pinId: string };
  to: { componentId: string; pinId: string };
  color: string;
  points: { x: number; y: number }[];
}

// Convert any legacy wire shape (sourceComponentId/segments, etc.) into the
// canonical WireConnection shape used throughout the app.
function normalizeWires(wires: unknown): NormalizedWire[] {
  if (!Array.isArray(wires)) return [];
  return wires.map((w: any, idx: number) => {
    const fromId = w.from?.componentId ?? w.sourceComponentId ?? w.source?.componentId;
    const fromPin = w.from?.pinId ?? w.sourcePinId ?? w.source?.pinId;
    const toId = w.to?.componentId ?? w.targetComponentId ?? w.target?.componentId;
    const toPin = w.to?.pinId ?? w.targetPinId ?? w.target?.pinId;
    const points = Array.isArray(w.points) && w.points.length >= 2
      ? w.points
      : Array.isArray(w.segments) && w.segments.length >= 2
        ? w.segments
        : [{ x: 0, y: 0 }, { x: 0, y: 0 }];
    return {
      id: w.id ?? `wire-${idx}`,
      from: { componentId: fromId, pinId: fromPin },
      to: { componentId: toId, pinId: toPin },
      color: w.color ?? '#22c55e',
      points,
    };
  });
}

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, '0')).join('');
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

// The "current user" is the one persisted in localStorage by the auth store.
function getCurrentUser(): { id: string; email: string; name: string } | null {
  try {
    const raw = localStorage.getItem('rakit_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function requireUserId(): string {
  const user = getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

// ---------------------------------------------------------------------------
// AI (bring-your-own-key, called directly from the browser)
// ---------------------------------------------------------------------------

async function getActiveProvider() {
  const userId = requireUserId();
  const [active] = await db
    .select()
    .from(aiProviders)
    .where(and(eq(aiProviders.userId, userId), eq(aiProviders.isActive, true)));
  if (active) {
    return { baseUrl: active.baseUrl, apiKey: active.apiKey, model: active.model };
  }
  // Fallback to locally configured default provider (Settings) or bundled env.
  const local = localStorage.getItem('rakit_ai');
  if (local) {
    try {
      const cfg = JSON.parse(local);
      if (cfg.apiKey) return { baseUrl: cfg.baseUrl, apiKey: cfg.apiKey, model: cfg.model };
    } catch { /* ignore */ }
  }
  const env = import.meta.env;
  return {
    baseUrl: (env.VITE_AI_BASE_URL as string) || 'https://api.openai.com/v1',
    apiKey: (env.VITE_AI_API_KEY as string) || '',
    model: (env.VITE_AI_MODEL as string) || 'gpt-4o-mini',
  };
}

async function callAI(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  maxTokens = 4096,
): Promise<string> {
  if (!apiKey) throw new Error('No AI API key configured. Add one in Settings.');
  const url = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI provider error (${response.status}): ${errorText}`);
  }
  const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}

function stripFences(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

// ---------------------------------------------------------------------------
// API surface (shape preserved from the previous HTTP client)
// ---------------------------------------------------------------------------

export const api = {
  auth: {
    register: async (email: string, password: string, name: string) => {
      if (!email || !password || !name) throw new Error('email, password, and name are required');
      if (password.length < 8) throw new Error('Password must be at least 8 characters');

      const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing) throw new Error('Email already registered');

      const now = new Date().toISOString();
      const userId = generateId();
      const passwordHash = await hashPassword(password);

      await db.insert(users).values({
        id: userId,
        email,
        name,
        passwordHash,
        avatarUrl: null,
        createdAt: now,
        updatedAt: now,
      });

      const token = createSessionToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await db.insert(sessions).values({
        id: generateId(),
        userId,
        token,
        expiresAt,
        createdAt: now,
      });

      const user = { id: userId, email, name, avatarUrl: null as string | null };
      return { token, user };
    },

    login: async (email: string, password: string) => {
      if (!email || !password) throw new Error('email and password are required');

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user) throw new Error('Invalid email or password');

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) throw new Error('Invalid email or password');

      const now = new Date().toISOString();
      const token = createSessionToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await db.insert(sessions).values({
        id: generateId(),
        userId: user.id,
        token,
        expiresAt,
        createdAt: now,
      });

      return {
        token,
        user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
      };
    },

    logout: async () => {
      const token = localStorage.getItem('rakit_token');
      if (token) {
        try { await db.delete(sessions).where(eq(sessions.token, token)); } catch { /* ignore */ }
      }
    },

    me: async () => {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      return user;
    },
  },

  projects: {
    list: async () => {
      const userId = requireUserId();
      const rows = await db
        .select({
          id: projects.id,
          name: projects.name,
          description: projects.description,
          updatedAt: projects.updatedAt,
        })
        .from(projects)
        .where(eq(projects.userId, userId));
      return rows;
    },

    get: async (id: string) => {
      const userId = requireUserId();
      const [row] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, userId)))
        .limit(1);
      if (!row) throw new Error('Project not found');
      const data = JSON.parse(row.data || '{}') as Record<string, unknown>;
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        version: row.version,
        files: (data.files as Project['files']) ?? [],
        components: (data.components as Project['components']) ?? [],
        wires: normalizeWires(data.wires),
        settings: (data.settings ?? {}) as Project['settings'],
      };
    },

    create: async (data: {
      name: string;
      description?: string;
      boardId?: string;
      code?: string;
      wiring?: string;
    }) => {
      const userId = requireUserId();
      const now = new Date().toISOString();
      const id = generateId();
      const boardId = data.boardId || 'arduino-uno';

      let payload: Record<string, unknown> = {
        files: [],
        components: [],
        wires: [],
        settings: { boardId, clockSpeed: 16000000, voltage: 5, serialBaudRate: 9600 },
      };

      if (data.code || data.wiring) {
        const files = [];
        if (data.code) {
          files.push({
            id: generateId(),
            name: 'sketch.ino',
            path: '/sketch.ino',
            content: data.code,
            language: 'ino',
            isOpen: true,
            isDirty: false,
          });
        }

        let wiringData: any = {};
        if (data.wiring) {
          try {
            wiringData = JSON.parse(data.wiring);
          } catch { /* ignore */ }
        }

        payload = {
          files,
          components: wiringData.components || [],
          wires: wiringData.wires || [],
          settings: {
            boardId: wiringData.boardId || boardId,
            clockSpeed: wiringData.settings?.clockSpeed || 16000000,
            voltage: wiringData.settings?.voltage || 5,
            serialBaudRate: wiringData.settings?.serialBaudRate || 9600,
          },
        };
      }

      await db.insert(projects).values({
        id,
        userId,
        name: data.name,
        description: data.description || '',
        boardId,
        data: JSON.stringify(payload),
        createdAt: now,
        updatedAt: now,
      });
      return { id, name: data.name };
    },

    update: async (id: string, data: Record<string, unknown>) => {
      const userId = requireUserId();
      const [existing] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, userId)))
        .limit(1);
      if (!existing) throw new Error('Project not found');

      const now = new Date().toISOString();
      const current = JSON.parse(existing.data || '{}') as Record<string, unknown>;
      const merged = { ...current, ...data };
      const name = typeof data.name === 'string' ? data.name : existing.name;
      const description = typeof data.description === 'string' ? data.description : existing.description;

      await db
        .update(projects)
        .set({
          name,
          description,
          data: JSON.stringify(merged),
          updatedAt: now,
          version: existing.version + 1,
        })
        .where(eq(projects.id, id));

      return { id };
    },

    delete: async (id: string) => {
      const userId = requireUserId();
      await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
    },
  },

  ai: {
    chat: async (messages: Array<{ role: string; content: string }>) => {
      if (!messages?.length) throw new Error('messages array is required');
      const cfg = await getActiveProvider();
      const content = await callAI(cfg.baseUrl, cfg.apiKey, cfg.model, messages);
      return { reply: content };
    },

    generate: async (description: string) => {
      if (!description) throw new Error('description is required');
      const cfg = await getActiveProvider();
      const systemPrompt = `You are an embedded systems expert. Generate an Arduino project from the user's description.
Return a JSON object with this structure:
{
  "name": "project name",
  "description": "brief description",
  "boardId": "arduino-uno",
  "components": [],
  "wires": [],
  "files": [{ "name": "main.ino", "content": "", "language": "ino", "isMain": true }],
  "settings": { "boardId": "arduino-uno", "clockSpeed": 16000000, "voltage": 5, "serialBaudRate": 9600 }
}
Return ONLY valid JSON, no markdown fences.`;
      const content = await callAI(cfg.baseUrl, cfg.apiKey, cfg.model, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: description },
      ]);
      const project = JSON.parse(stripFences(content));
      return { project };
    },

    explain: async (code: string) => {
      if (!code) throw new Error('code is required');
      const cfg = await getActiveProvider();
      const content = await callAI(cfg.baseUrl, cfg.apiKey, cfg.model, [
        { role: 'system', content: 'You are an embedded systems expert. Explain the following code concisely in markdown.' },
        { role: 'user', content: code },
      ]);
      return { explanation: content };
    },

    fixWiring: async (project: unknown) => {
      const cfg = await getActiveProvider();
      const systemPrompt = `You are an embedded systems wiring expert. Validate the wiring and fix issues. Return ONLY JSON: { "valid": boolean, "issues": [], "fixedWires": [], "explanation": "" }`;
      const content = await callAI(cfg.baseUrl, cfg.apiKey, cfg.model, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(project) },
      ]);
      return JSON.parse(stripFences(content));
    },
  },

  providers: {
    list: async () => {
      const userId = requireUserId();
      return db.select().from(aiProviders).where(eq(aiProviders.userId, userId));
    },

    create: async (data: { name: string; provider: string; baseUrl: string; apiKey: string; model: string }) => {
      const userId = requireUserId();
      const now = new Date().toISOString();
      const id = generateId();
      await db.insert(aiProviders).values({
        id,
        userId,
        name: data.name,
        provider: data.provider,
        baseUrl: data.baseUrl,
        apiKey: data.apiKey,
        model: data.model,
        isActive: false,
        createdAt: now,
        updatedAt: now,
      });
      return { id, name: data.name, isActive: false };
    },

    update: async (id: string, data: { name?: string; provider?: string; baseUrl?: string; apiKey?: string; model?: string }) => {
      const userId = requireUserId();
      const now = new Date().toISOString();
      await db
        .update(aiProviders)
        .set({ ...data, updatedAt: now })
        .where(and(eq(aiProviders.id, id), eq(aiProviders.userId, userId)));
      return { id };
    },

    delete: async (id: string) => {
      const userId = requireUserId();
      await db.delete(aiProviders).where(and(eq(aiProviders.id, id), eq(aiProviders.userId, userId)));
    },

    activate: async (id: string) => {
      const userId = requireUserId();
      const now = new Date().toISOString();
      // Deactivate all of the user's providers, then activate the chosen one.
      await db.update(aiProviders).set({ isActive: false, updatedAt: now }).where(eq(aiProviders.userId, userId));
      await db.update(aiProviders).set({ isActive: true, updatedAt: now }).where(and(eq(aiProviders.id, id), eq(aiProviders.userId, userId)));
      return { id, isActive: true };
    },
  },
};

// Re-export schema/db for scripts/tests that need direct access.
export { db, schema };
