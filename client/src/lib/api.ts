const API_BASE = '/api';

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
    list: () =>
      request<Array<{ id: string; name: string; description: string; updatedAt: string }>>('/projects'),
    get: (id: string) =>
      request<{ id: string; name: string; description: string; files: unknown[]; components: unknown[]; wires: unknown[]; settings: unknown }>(`/projects/${id}`),
    create: (data: { name: string; description?: string; boardId?: string }) =>
      request<{ id: string; name: string }>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Record<string, unknown>) =>
      request<{ id: string }>(`/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
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
};
