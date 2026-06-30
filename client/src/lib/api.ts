const API_BASE = '/api';

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

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('rakit_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    register: (email: string, password: string, name: string) =>
      request<{ token: string; user: { id: string; email: string; name: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }),
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string; name: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    logout: () =>
      request<void>('/auth/logout', { method: 'POST' }),
    me: () =>
      request<{ id: string; email: string; name: string }>('/auth/me'),
  },
  projects: {
    list: async () => {
      const res = await request<{ projects: Array<{ id: string; name: string; description: string; updatedAt: string }> }>('/projects');
      return res.projects;
    },
    get: async (id: string) => {
      const res = await request<{ project: { id: string; name: string; description: string; createdAt: string; updatedAt: string; version: number; data: { files: unknown[]; components: unknown[]; wires: unknown[]; settings: unknown } } }>(`/projects/${id}`);
      const data = res.project.data as any;
      return {
        ...res.project,
        files: data.files ?? [],
        components: data.components ?? [],
        wires: normalizeWires(data.wires),
        settings: data.settings ?? {},
      };
    },
    create: async (data: { name: string; description?: string; boardId?: string }) => {
      const res = await request<{ project: { id: string; name: string } }>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.project;
    },
    update: async (id: string, data: Record<string, unknown>) => {
      const res = await request<{ project: { id: string } }>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.project;
    },
    delete: (id: string) =>
      request<void>(`/projects/${id}`, { method: 'DELETE' }),
  },
  ai: {
    chat: (messages: Array<{ role: string; content: string }>) =>
      request<{ reply: string }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages }),
      }),
    generate: (description: string) =>
      request<{ project: unknown }>('/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ description }),
      }),
    explain: (code: string) =>
      request<{ explanation: string }>('/ai/explain', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
    fixWiring: (project: unknown) =>
      request<{ fixes: unknown[] }>('/ai/fix-wiring', {
        method: 'POST',
        body: JSON.stringify({ project }),
      }),
  },
  providers: {
    list: () =>
      request<Array<{ id: string; name: string; provider: string; baseUrl: string; model: string; isActive: boolean }>>('/providers'),
    create: (data: { name: string; provider: string; baseUrl: string; apiKey: string; model: string }) =>
      request<{ id: string; name: string; isActive: boolean }>('/providers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { name?: string; provider?: string; baseUrl?: string; apiKey?: string; model?: string }) =>
      request<{ id: string }>(`/providers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/providers/${id}`, { method: 'DELETE' }),
    activate: (id: string) =>
      request<{ id: string; isActive: boolean }>(`/providers/${id}/activate`, { method: 'POST' }),
  },
};
