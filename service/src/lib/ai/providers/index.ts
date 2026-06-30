import type { AIConfig, AIProviderInstance } from '../types';
import { openaiChat, openaiStreamChat } from './openai';
import { anthropicChat, anthropicStreamChat } from './anthropic';
import { geminiChat, geminiStreamChat } from './gemini';
import { openrouterChat, openrouterStreamChat } from './openrouter';

export function createProvider(config: AIConfig): AIProviderInstance {
  switch (config.provider) {
    case 'openai':
      return { chat: openaiChat, streamChat: openaiStreamChat };
    case 'anthropic':
      return { chat: anthropicChat, streamChat: anthropicStreamChat };
    case 'gemini':
      return { chat: geminiChat, streamChat: geminiStreamChat };
    case 'openrouter':
      return { chat: openrouterChat, streamChat: openrouterStreamChat };
    case 'local':
      return {
        chat: async (messages, cfg) => openaiChat(messages, { ...cfg, baseUrl: cfg.baseUrl ?? 'http://localhost:11434/v1/chat/completions' }),
        streamChat: async function* (messages, cfg) {
          yield* openaiStreamChat(messages, { ...cfg, baseUrl: cfg.baseUrl ?? 'http://localhost:11434/v1/chat/completions' });
        },
      };
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}

export { openaiChat, openaiStreamChat } from './openai';
export { anthropicChat, anthropicStreamChat } from './anthropic';
export { geminiChat, geminiStreamChat } from './gemini';
export { openrouterChat, openrouterStreamChat } from './openrouter';
