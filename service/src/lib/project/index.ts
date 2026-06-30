import type {
  Project,
  ProjectFile,
  ProjectSettings,
  ComponentInstance,
  WireConnection,
} from '../shared';
import { generateId } from '../shared';

function now(): string {
  return new Date().toISOString();
}

export function createProject(name: string, boardId: string): Project {
  const mainFileId = generateId();
  const timestamp = now();

  return {
    id: generateId(),
    name,
    description: '',
    boardId,
    components: [],
    wires: [],
    files: [
      {
        id: mainFileId,
        name: `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}.ino`,
        content: `void setup() {\n  // put your setup code here, to run once:\n\n}\n\nvoid loop() {\n  // put your main code here, to run repeatedly:\n\n}\n`,
        language: 'ino',
        isMain: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    libraries: [],
    tests: [],
    settings: {
      boardId,
      clockSpeed: 16000000,
      voltage: 5,
      serialBaudRate: 9600,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    version: 1,
  };
}

export function serializeProject(project: Project): string {
  return JSON.stringify(project, null, 2);
}

export function deserializeProject(data: string): Project {
  const parsed = JSON.parse(data) as Project;

  if (!parsed.id || !parsed.name || !parsed.boardId) {
    throw new Error('Invalid project data: missing required fields');
  }

  return {
    ...parsed,
    components: parsed.components ?? [],
    wires: parsed.wires ?? [],
    files: parsed.files ?? [],
    libraries: parsed.libraries ?? [],
    tests: parsed.tests ?? [],
    settings: parsed.settings
      ? { ...parsed.settings }
      : {
          boardId: parsed.boardId,
          clockSpeed: 16000000,
          voltage: 5,
          serialBaudRate: 9600,
        },
    version: parsed.version ?? 1,
  };
}

export function addFile(
  project: Project,
  name: string,
  content: string,
  language: ProjectFile['language']
): Project {
  const timestamp = now();
  const file: ProjectFile = {
    id: generateId(),
    name,
    content,
    language,
    isMain: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return {
    ...project,
    files: [...project.files, file],
    updatedAt: timestamp,
    version: project.version + 1,
  };
}

export function updateFile(
  project: Project,
  fileId: string,
  content: string
): Project {
  const timestamp = now();

  return {
    ...project,
    files: project.files.map((f) =>
      f.id === fileId
        ? { ...f, content, updatedAt: timestamp }
        : f
    ),
    updatedAt: timestamp,
    version: project.version + 1,
  };
}

export function removeFile(project: Project, fileId: string): Project {
  const file = project.files.find((f) => f.id === fileId);
  if (file?.isMain) {
    throw new Error('Cannot remove the main file');
  }

  const timestamp = now();

  return {
    ...project,
    files: project.files.filter((f) => f.id !== fileId),
    updatedAt: timestamp,
    version: project.version + 1,
  };
}

export function addComponent(
  project: Project,
  definitionId: string,
  x: number,
  y: number
): Project {
  const timestamp = now();
  const instance: ComponentInstance = {
    id: generateId(),
    definitionId,
    x,
    y,
    rotation: 0,
    properties: {},
  };

  return {
    ...project,
    components: [...project.components, instance],
    updatedAt: timestamp,
    version: project.version + 1,
  };
}

export function removeComponent(project: Project, componentId: string): Project {
  const timestamp = now();

  return {
    ...project,
    components: project.components.filter((c) => c.id !== componentId),
    wires: project.wires.filter(
      (w) =>
        w.sourceComponentId !== componentId &&
        w.targetComponentId !== componentId
    ),
    updatedAt: timestamp,
    version: project.version + 1,
  };
}

export function updateComponent(
  project: Project,
  componentId: string,
  updates: Partial<ComponentInstance>
): Project {
  const timestamp = now();

  return {
    ...project,
    components: project.components.map((c) =>
      c.id === componentId ? { ...c, ...updates } : c
    ),
    updatedAt: timestamp,
    version: project.version + 1,
  };
}

export function addWire(
  project: Project,
  wire: Omit<WireConnection, 'id'>
): Project {
  const timestamp = now();
  const newWire: WireConnection = {
    ...wire,
    id: generateId(),
  };

  return {
    ...project,
    wires: [...project.wires, newWire],
    updatedAt: timestamp,
    version: project.version + 1,
  };
}

export function removeWire(project: Project, wireId: string): Project {
  const timestamp = now();

  return {
    ...project,
    wires: project.wires.filter((w) => w.id !== wireId),
    updatedAt: timestamp,
    version: project.version + 1,
  };
}

export function exportAsIno(project: Project): string {
  const mainFile = project.files.find((f) => f.isMain);
  if (!mainFile) {
    throw new Error('No main file found in project');
  }

  const includes = new Set<string>();
  const definitions: string[] = [];

  for (const lib of project.libraries) {
    includes.add(`#include <${lib.name}.h>`);
  }

  if (project.settings.serialBaudRate > 0) {
    const hasSerialBegin = mainFile.content.includes('Serial.begin');
    if (!hasSerialBegin) {
      includes.add('// Note: Add Serial.begin() to setup() if using serial communication');
    }
  }

  const parts: string[] = [];

  if (includes.size > 0) {
    parts.push([...includes].join('\n'));
    parts.push('');
  }

  if (definitions.length > 0) {
    parts.push(definitions.join('\n'));
    parts.push('');
  }

  parts.push(mainFile.content);

  return parts.join('\n');
}

export function exportAsJson(project: Project): string {
  return serializeProject(project);
}
