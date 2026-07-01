export const PinMode = {
  INPUT: 'INPUT',
  OUTPUT: 'OUTPUT',
  INPUT_PULLUP: 'INPUT_PULLUP',
  PWM: 'PWM',
  ANALOG: 'ANALOG',
  I2C_SDA: 'I2C_SDA',
  I2C_SCL: 'I2C_SCL',
  SPI_MOSI: 'SPI_MOSI',
  SPI_MISO: 'SPI_MISO',
  SPI_SCK: 'SPI_SCK',
  SPI_CS: 'SPI_CS',
  GND: 'GND',
  VCC: 'VCC',
  VIN: 'VIN',
} as const;

export type PinMode = (typeof PinMode)[keyof typeof PinMode];

export interface PinDefinition {
  id: string;
  name: string;
  mode: PinMode;
  x: number;
  y: number;
  number: number;
}

export interface BoardDefinition {
  id: string;
  name: string;
  displayName: string;
  width: number;
  height: number;
  pins: PinDefinition[];
  flashSize: number;
  sramSize: number;
  clockSpeed: number;
}

export interface ComponentPin {
  id: string;
  name: string;
  mode: PinMode;
  x: number;
  y: number;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  width: number;
  height: number;
  pins: ComponentPin[];
  icon: string;
  defaultCode?: string;
}

export interface ComponentInstance {
  id: string;
  definitionId: string;
  x: number;
  y: number;
  rotation: number;
  label: string;
  properties: Record<string, string | number | boolean>;
}

export interface WireConnection {
  id: string;
  from: { componentId: string; pinId: string };
  to: { componentId: string; pinId: string };
  color: string;
  points: WirePoint[];
}

export interface WirePoint {
  x: number;
  y: number;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isOpen: boolean;
  isDirty: boolean;
}

export interface ProjectSettings {
  boardId: string;
  clockSpeed: number;
  compileFlags: string[];
  libraries: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  files: ProjectFile[];
  components: ComponentInstance[];
  wires: WireConnection[];
  settings: ProjectSettings;
}

export type SimulationState = 'idle' | 'running' | 'paused' | 'error' | 'stepping';

export interface SimulationEvent {
  id: string;
  timestamp: number;
  type: 'pin_change' | 'serial_output' | 'component_state' | 'error';
  componentId?: string;
  pinId?: string;
  value: string | number | boolean;
  message?: string;
}

export interface SimulationSnapshot {
  readonly timestamp: number;
  readonly pinStates: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly componentStates: Readonly<Record<string, Readonly<Record<string, string | number | boolean>>>>;
  readonly serialBuffer: string;
  readonly cycleCount: number;
  readonly variables?: Record<string, any>;
  readonly callStack?: string[];
  readonly currentLine?: number;
}

export type ImmutableSimulationSnapshot = {
  readonly [K in keyof SimulationSnapshot]: SimulationSnapshot[K];
};

export interface SimulationConfig {
  speed: number;
  maxCyclesPerStep: number;
  enableSerial: boolean;
  enableDebug: boolean;
  breakpoints: string[];
}
