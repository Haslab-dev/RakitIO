export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'local';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  model: string;
  provider: AIProvider;
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
}

export interface AIProviderInstance {
  chat(messages: AIMessage[], config: AIConfig): Promise<AIResponse>;
  streamChat(messages: AIMessage[], config: AIConfig): AsyncGenerator<AIStreamChunk>;
}

export type ProjectGenerationResult = {
  name: string;
  description: string;
  boardId: string;
  code: string;
  components: Array<{ definitionId: string; properties: Record<string, unknown> }>;
  wires: Array<{
    source: { componentId: string; pinId: string };
    target: { componentId: string; pinId: string };
    color: string;
  }>;
  libraries: string[];
};
