import type { AIConfig, ProjectGenerationResult } from './types';
import type { Project } from '../shared';
import { createProvider } from './providers';
import { SYSTEM_PROMPTS } from './prompts';

function extractJSON(text: string): string {
  const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (jsonMatch) return jsonMatch[1].trim();

  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) return braceMatch[0];

  return text.trim();
}

export async function generateProject(
  description: string,
  config: AIConfig,
): Promise<ProjectGenerationResult> {
  const provider = createProvider(config);

  const response = await provider.chat(
    [
      { role: 'system', content: SYSTEM_PROMPTS.projectGeneration },
      { role: 'user', content: description },
    ],
    config,
  );

  const jsonText = extractJSON(response.content);

  let result: ProjectGenerationResult;
  try {
    result = JSON.parse(jsonText);
  } catch {
    throw new Error(
      `Failed to parse AI response as JSON. Raw response:\n${response.content}`,
    );
  }

  if (!result.name || !result.boardId || !result.code) {
    throw new Error(
      'Invalid project generation result: missing required fields (name, boardId, code)',
    );
  }

  return result;
}

export async function explainCode(
  code: string,
  config: AIConfig,
): Promise<string> {
  const provider = createProvider(config);

  const response = await provider.chat(
    [
      { role: 'system', content: SYSTEM_PROMPTS.codeExplanation },
      { role: 'user', content: `Explain this embedded code:\n\n\`\`\`cpp\n${code}\n\`\`\`` },
    ],
    config,
  );

  return response.content;
}

export async function validateWiring(
  project: Project,
  config: AIConfig,
): Promise<string> {
  const provider = createProvider(config);

  const projectData = JSON.stringify(
    {
      boardId: project.boardId,
      components: project.components,
      wires: project.wires,
    },
    null,
    2,
  );

  const response = await provider.chat(
    [
      { role: 'system', content: SYSTEM_PROMPTS.wiringValidation },
      { role: 'user', content: `Validate the wiring for this project:\n\n${projectData}` },
    ],
    config,
  );

  return response.content;
}

export async function detectErrors(
  code: string,
  config: AIConfig,
): Promise<string> {
  const provider = createProvider(config);

  const response = await provider.chat(
    [
      { role: 'system', content: SYSTEM_PROMPTS.errorDetection },
      { role: 'user', content: `Detect errors in this embedded code:\n\n\`\`\`cpp\n${code}\n\`\`\`` },
    ],
    config,
  );

  return response.content;
}

export async function convertBoard(
  code: string,
  fromBoard: string,
  toBoard: string,
  config: AIConfig,
): Promise<string> {
  const provider = createProvider(config);

  const response = await provider.chat(
    [
      { role: 'system', content: SYSTEM_PROMPTS.boardConversion },
      {
        role: 'user',
        content: `Convert this code from ${fromBoard} to ${toBoard}:\n\n\`\`\`cpp\n${code}\n\`\`\``,
      },
    ],
    config,
  );

  return response.content;
}

export async function generateDocs(
  project: Project,
  config: AIConfig,
): Promise<string> {
  const provider = createProvider(config);

  const projectData = JSON.stringify(
    {
      name: project.name,
      description: project.description,
      boardId: project.boardId,
      components: project.components,
      wires: project.wires,
      files: project.files,
      libraries: project.libraries,
    },
    null,
    2,
  );

  const response = await provider.chat(
    [
      { role: 'system', content: SYSTEM_PROMPTS.documentationGeneration },
      { role: 'user', content: `Generate documentation for this project:\n\n${projectData}` },
    ],
    config,
  );

  return response.content;
}

export async function* streamGenerateProject(
  description: string,
  config: AIConfig,
) {
  const provider = createProvider(config);

  const stream = provider.streamChat(
    [
      { role: 'system', content: SYSTEM_PROMPTS.projectGeneration },
      { role: 'user', content: description },
    ],
    config,
  );

  yield* stream;
}
