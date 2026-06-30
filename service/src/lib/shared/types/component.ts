import type { PinMode } from './pin';

export type ComponentCategory =
  | 'led'
  | 'button'
  | 'resistor'
  | 'sensor'
  | 'display'
  | 'actuator'
  | 'communication'
  | 'power'
  | 'storage'
  | 'input';

export interface ComponentPinDefinition {
  id: string;
  name: string;
  x: number;
  y: number;
  modes: PinMode[];
  required: boolean;
  description?: string;
}

export interface ComponentPropertyDefinition {
  key: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'color';
  default: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: unknown }[];
  description?: string;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  icon: string;
  svgComponentId: string;
  width: number;
  height: number;
  pins: ComponentPinDefinition[];
  properties: ComponentPropertyDefinition[];
  libraries?: string[];
  tags: string[];
}

export interface ComponentInstance {
  id: string;
  definitionId: string;
  x: number;
  y: number;
  rotation: number;
  properties: Record<string, unknown>;
  label?: string;
}
