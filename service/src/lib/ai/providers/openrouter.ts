import type { AIMessage, AIConfig, AIResponse, AIStreamChunk } from '../types';

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterChoice {
  message: { role: string; content: string };
  finish_reason: string;
}

interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface OpenRouterChatResponse {
  id: string;
  model: string;
  choices: OpenRouterChoice[];
  usage: OpenRouterUsage;
}

interface OpenRouterStreamDelta {
  choices: Array<{ delta: { content?: string }; finish_reason: string | null }>;
}

function getHeaders(config: AIConfig): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
    'HTTP-Referer': 'https://rakit-io.dev',
    'X-Title': 'RakitIO Embedded IDE',
  };
}

export async function openrouterChat(
  messages: AIMessage[],
  config: AIConfig,
): Promise<AIResponse> {
  const url = config.baseUrl ?? DEFAULT_BASE_URL;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(config),
    body: JSON.stringify({
      model: config.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: config.maxTokens ?? 4096,
      temperature: config.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }

  const data: OpenRouterChatResponse = await response.json();

  return {
    content: data.choices[0]?.message?.content ?? '',
    model: data.model,
    provider: 'openrouter',
    usage: data.usage
      ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      }
      : undefined,
  };
}

export async function* openrouterStreamChat(
  messages: AIMessage[],
  config: AIConfig,
): AsyncGenerator<AIStreamChunk> {
  const url = config.baseUrl ?? DEFAULT_BASE_URL;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(config),
    body: JSON.stringify({
      model: config.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: config.maxTokens ?? 4096,
      temperature: config.temperature ?? 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
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
        if (data === '[DONE]') {
          yield { content: '', done: true };
          return;
        }

        try {
          const parsed: OpenRouterStreamDelta = JSON.parse(data);
          const delta = parsed.choices[0]?.delta?.content;
          if (delta) {
            yield { content: delta, done: false };
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
