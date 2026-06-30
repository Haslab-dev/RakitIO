export type SimulationState = 'idle' | 'running' | 'paused' | 'stepping' | 'error';

export type SimulationEvent =
  | { type: 'gpio:write'; pin: string; value: number }
  | { type: 'gpio:read'; pin: string; value: number }
  | { type: 'adc:read'; pin: string; value: number }
  | { type: 'pwm:write'; pin: string; duty: number; frequency: number }
  | { type: 'uart:send'; port: string; data: Uint8Array }
  | { type: 'uart:receive'; port: string; data: Uint8Array }
  | { type: 'i2c:write'; address: number; register: number; data: Uint8Array }
  | { type: 'i2c:read'; address: number; register: number; data: Uint8Array }
  | { type: 'spi:transfer'; data: Uint8Array }
  | { type: 'serial:print'; text: string }
  | { type: 'delay'; ms: number }
  | { type: 'error'; message: string; source?: string }
  | { type: 'tick'; cycle: number; microseconds: number };

export interface SimulationConfig {
  speed: number;
  maxCyclesPerTick: number;
  enableSerialMonitor: boolean;
  enableDebugging: boolean;
}

export interface SimulationSnapshot {
  cycle: number;
  microseconds: number;
  gpio: Record<string, number>;
  analog: Record<string, number>;
  pwm: Record<string, { duty: number; frequency: number }>;
  serial: string[];
  components: Record<string, Record<string, unknown>>;
}

export interface SimulationMessage {
  type: 'start' | 'stop' | 'pause' | 'resume' | 'step' | 'reset' | 'tick' | 'event' | 'snapshot' | 'error' | 'ready';
  payload?: unknown;
}
