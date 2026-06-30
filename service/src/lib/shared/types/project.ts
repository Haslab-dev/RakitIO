import type { BoardDefinition } from './board';
import type { ComponentInstance } from './component';
import type { WireConnection } from './wire';

export interface ProjectSettings {
  boardId: string;
  clockSpeed: number;
  voltage: number;
  serialBaudRate: number;
}

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  language: 'cpp' | 'c' | 'h' | 'ino';
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectLibrary {
  name: string;
  version: string;
  source: 'official' | 'community' | 'custom';
}

export interface ProjectTest {
  id: string;
  name: string;
  description: string;
  inputs: Record<string, unknown>;
  expectedOutputs: Record<string, unknown>;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  boardId: string;
  components: ComponentInstance[];
  wires: WireConnection[];
  files: ProjectFile[];
  libraries: ProjectLibrary[];
  tests: ProjectTest[];
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ProjectExport {
  format: 'arduino-zip' | 'ino' | 'json' | 'svg' | 'pdf';
  data: Blob | string;
  filename: string;
}
