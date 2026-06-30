export type PinMode = 'input' | 'output' | 'input_pullup' | 'pwm' | 'analog' | 'serial' | 'i2c' | 'spi';

export type PinLevel = 0 | 1;

export interface PinDefinition {
  id: string;
  name: string;
  number: number;
  modes: PinMode[];
  x: number;
  y: number;
  group?: string;
}

export interface PinState {
  pinId: string;
  mode: PinMode;
  value: number;
  digitalValue: PinLevel;
  analogValue: number;
}

export interface PinCapabilities {
  digital: boolean;
  analog: boolean;
  pwm: boolean;
  serial: boolean;
  i2c: boolean;
  spi: boolean;
}
