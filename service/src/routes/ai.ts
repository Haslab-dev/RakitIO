import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Database } from '../db';

type AIEnv = {
  Bindings: {
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

const ai = new Hono<AIEnv>();

ai.use('/*', authMiddleware);

async function callAI(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  maxTokens = 4096,
): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI provider error (${response.status}): ${errorText}`);
  }

  const data = await response.json<{ choices: Array<{ message: { content: string } }> }>();
  return data.choices[0].message.content;
}

ai.post('/chat', async (c) => {
  const body = await c.req.json<{
    messages: Array<{ role: string; content: string }>;
    maxTokens?: number;
  }>();

  if (!body.messages || body.messages.length === 0) {
    return c.json({ error: 'messages array is required' }, 400);
  }

  try {
    const content = await callAI(
      c.env.AI_BASE_URL,
      c.env.AI_API_KEY,
      c.env.AI_MODEL,
      body.messages,
      body.maxTokens,
    );

    return c.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown AI error';
    return c.json({ error: message }, 502);
  }
});

ai.post('/generate', async (c) => {
  const body = await c.req.json<{
    description: string;
    boardId?: string;
  }>();

  if (!body.description) {
    return c.json({ error: 'description is required' }, 400);
  }

  const systemPrompt = `You are an embedded systems expert. Generate an Arduino project from the user's description.
Return a JSON object with this structure:
{
  "name": "project name",
  "description": "brief description",
  "boardId": "${body.boardId ?? 'arduino-uno'}",
  "components": [
    {
      "definitionId": "component-type",
      "x": 0,
      "y": 0,
      "rotation": 0,
      "properties": {},
      "label": "optional label"
    }
  ],
  "wires": [
    {
      "sourceComponentId": "id",
      "sourcePinId": "pin",
      "targetComponentId": "id",
      "targetPinId": "pin",
      "color": "#000000"
    }
  ],
  "files": [
    {
      "name": "main.ino",
      "content": "void setup() { ... } void loop() { ... }",
      "language": "ino",
      "isMain": true
    }
  ],
  "settings": {
    "boardId": "${body.boardId ?? 'arduino-uno'}",
    "clockSpeed": 16000000,
    "voltage": 5,
    "serialBaudRate": 9600
  }
}
Return ONLY valid JSON, no markdown fences.`;

  try {
    const content = await callAI(
      c.env.AI_BASE_URL,
      c.env.AI_API_KEY,
      c.env.AI_MODEL,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: body.description },
      ],
    );

    let parsed: unknown;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return c.json({ error: 'AI returned invalid JSON', raw: content }, 502);
    }

    return c.json({ project: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown AI error';
    return c.json({ error: message }, 502);
  }
});

ai.post('/explain', async (c) => {
  const body = await c.req.json<{
    code: string;
    language?: string;
  }>();

  if (!body.code) {
    return c.json({ error: 'code is required' }, 400);
  }

  const language = body.language ?? 'cpp';
  const systemPrompt = `You are an embedded systems expert. Explain the following ${language} code in a clear, concise manner.
Cover:
1. What the code does overall
2. Key functions and their purposes
3. Hardware interactions (pins, protocols, etc.)
4. Any potential issues or improvements
Format your response in markdown.`;

  try {
    const content = await callAI(
      c.env.AI_BASE_URL,
      c.env.AI_API_KEY,
      c.env.AI_MODEL,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: body.code },
      ],
    );

    return c.json({ explanation: content });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown AI error';
    return c.json({ error: message }, 502);
  }
});

ai.post('/fix-wiring', async (c) => {
  const body = await c.req.json<{
    components: Array<{
      id: string;
      definitionId: string;
      properties: Record<string, unknown>;
    }>;
    wires: Array<{
      sourceComponentId: string;
      sourcePinId: string;
      targetComponentId: string;
      targetPinId: string;
      color: string;
    }>;
    boardId: string;
  }>();

  if (!body.components || !body.wires || !body.boardId) {
    return c.json({ error: 'components, wires, and boardId are required' }, 400);
  }

  const systemPrompt = `You are an embedded systems wiring expert. Given a list of components and their current wiring, validate the connections and fix any issues.
Common issues to check:
- Missing ground connections
- Missing power connections
- Incorrect pin modes (e.g., analog pin used as digital)
- Short circuits
- Missing pull-up/pull-down resistors for buttons
- LED without current-limiting resistor
Return a JSON object:
{
  "valid": true/false,
  "issues": ["description of issue 1", ...],
  "fixedWires": [ ... same format as input wires ... ],
  "explanation": "what was changed and why"
}
Return ONLY valid JSON, no markdown fences.`;

  try {
    const content = await callAI(
      c.env.AI_BASE_URL,
      c.env.AI_API_KEY,
      c.env.AI_MODEL,
      [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: JSON.stringify({
            boardId: body.boardId,
            components: body.components,
            wires: body.wires,
          }),
        },
      ],
    );

    let parsed: unknown;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return c.json({ error: 'AI returned invalid JSON', raw: content }, 502);
    }

    return c.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown AI error';
    return c.json({ error: message }, 502);
  }
});

export default ai;
