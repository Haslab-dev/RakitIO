import type { AIMessage, AIConfig, AIResponse, AIStreamChunk } from '../types';

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

interface GeminiCandidate {
  content: GeminiContent;
  finishReason: string;
}

interface GeminiUsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

interface GeminiGenerateResponse {
  candidates: GeminiCandidate[];
  usageMetadata: GeminiUsageMetadata;
}

function buildContents(messages: AIMessage[]): {
  systemInstruction?: GeminiContent;
  contents: GeminiContent[];
} {
  let systemInstruction: GeminiContent | undefined;
  const contents: GeminiContent[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemInstruction = {
        role: 'user',
        parts: [{ text: msg.content }],
      };
    } else {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }

  return { systemInstruction, contents };
}

function getBaseUrl(config: AIConfig): string {
  if (config.baseUrl) return config.baseUrl;
  return `https://generativelanguage.googleapis.com/v1beta/models/${config.model}`;
}

export async function geminiChat(messages: AIMessage[], config: AIConfig): Promise<AIResponse> {
  const base = getBaseUrl(config);
  const url = `${base}:generateContent?key=${config.apiKey}`;

  const { systemInstruction, contents } = buildContents(messages);

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: config.maxTokens ?? 4096,
      temperature: config.temperature ?? 0.7,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = systemInstruction;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data: GeminiGenerateResponse = await response.json();

  const textContent =
    data.candidates
      ?.flatMap((c) => c.content.parts.map((p) => p.text))
      .join('') ?? '';

  return {
    content: textContent,
    model: config.model,
    provider: 'gemini',
    usage: data.usageMetadata
      ? {
          promptTokens: data.usageMetadata.promptTokenCount,
          completionTokens: data.usageMetadata.candidatesTokenCount,
          totalTokens: data.usageMetadata.totalTokenCount,
        }
      : undefined,
  };
}

export async function* geminiStreamChat(
  messages: AIMessage[],
  config: AIConfig,
): AsyncGenerator<AIStreamChunk> {
  const base = getBaseUrl(config);
  const url = `${base}:streamGenerateContent?alt=sse&key=${config.apiKey}`;

  const { systemInstruction, contents } = buildContents(messages);

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: config.maxTokens ?? 4096,
      temperature: config.temperature ?? 0.7,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = systemInstruction;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
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
          const parsed: GeminiGenerateResponse = JSON.parse(data);
          const text = parsed.candidates
            ?.flatMap((c) => c.content.parts.map((p) => p.text))
            .join('');

          if (text) {
            yield { content: text, done: false };
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
