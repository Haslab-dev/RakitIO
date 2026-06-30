import type { AIMessage, AIConfig, AIResponse, AIStreamChunk } from '../types';

const DEFAULT_BASE_URL = 'https://api.anthropic.com/v1/messages';

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
}

interface AnthropicChatResponse {
  id: string;
  model: string;
  content: AnthropicContentBlock[];
  usage: AnthropicUsage;
  stop_reason: string;
}

interface AnthropicStreamEvent {
  type: string;
  delta?: { type: string; text?: string };
  usage?: { input_tokens: number; output_tokens: number };
}

function extractSystem(messages: AIMessage[]): { system: string; rest: AIMessage[] } {
  const systemParts: string[] = [];
  const rest: AIMessage[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemParts.push(msg.content);
    } else {
      rest.push(msg);
    }
  }

  return { system: systemParts.join('\n\n'), rest };
}

export async function anthropicChat(messages: AIMessage[], config: AIConfig): Promise<AIResponse> {
  const url = config.baseUrl ?? DEFAULT_BASE_URL;
  const { system, rest } = extractSystem(messages);

  const body: Record<string, unknown> = {
    model: config.model,
    max_tokens: config.maxTokens ?? 4096,
    messages: rest.map((m) => ({ role: m.role, content: m.content })),
  };

  if (system) {
    body.system = system;
  }

  if (config.temperature !== undefined) {
    body.temperature = config.temperature;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorBody}`);
  }

  const data: AnthropicChatResponse = await response.json();

  const textContent = data.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('');

  return {
    content: textContent,
    model: data.model,
    provider: 'anthropic',
    usage: data.usage
      ? {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        }
      : undefined,
  };
}

export async function* anthropicStreamChat(
  messages: AIMessage[],
  config: AIConfig,
): AsyncGenerator<AIStreamChunk> {
  const url = config.baseUrl ?? DEFAULT_BASE_URL;
  const { system, rest } = extractSystem(messages);

  const body: Record<string, unknown> = {
    model: config.model,
    max_tokens: config.maxTokens ?? 4096,
    messages: rest.map((m) => ({ role: m.role, content: m.content })),
    stream: true,
  };

  if (system) {
    body.system = system;
  }

  if (config.temperature !== undefined) {
    body.temperature = config.temperature;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorBody}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body available for streaming');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6);

        try {
          const parsed: AnthropicStreamEvent = JSON.parse(data);

          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            yield { content: parsed.delta.text, done: false };
          }

          if (parsed.type === 'message_stop') {
            yield { content: '', done: true };
            return;
          }
        } catch {
          // skip malformed JSON lines
        }
      }
    }

    yield { content: '', done: true };
  } finally {
    reader.releaseLock();
  }
}
