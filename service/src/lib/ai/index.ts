export type {
  AIProvider,
  AIConfig,
  AIMessage,
  AIResponse,
  AIStreamChunk,
  AIProviderInstance,
  ProjectGenerationResult,
} from './types';

export {
  createProvider,
  openaiChat,
  openaiStreamChat,
  anthropicChat,
  anthropicStreamChat,
  geminiChat,
  geminiStreamChat,
  openrouterChat,
  openrouterStreamChat,
} from './providers';

export { SYSTEM_PROMPTS } from './prompts';

export {
  generateProject,
  explainCode,
  validateWiring,
  detectErrors,
  convertBoard,
  generateDocs,
  streamGenerateProject,
} from './generator';
