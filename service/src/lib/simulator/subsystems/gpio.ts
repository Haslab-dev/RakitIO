import type { PinMode } from '../../shared';

export interface GPIOSubsystem {
  pinMode(pin: number, mode: PinMode): void;
  digitalRead(pin: number): number;
  digitalWrite(pin: number, value: number): void;
  getPinState(pin: number): { mode: PinMode; value: number };
  getAllPins(): Map<number, { mode: PinMode; value: number }>;
  reset(): void;
}

const MODE_MAP: Record<string, string> = {
  input: 'input',
  output: 'output',
  input_pullup: 'input_pullup',
  pwm: 'pwm',
  analog: 'analog',
  serial: 'serial',
  i2c: 'i2c',
  spi: 'spi',
};

export function createGPIO(): GPIOSubsystem {
  const pins = new Map<number, { mode: PinMode; value: number }>();

  function ensurePin(pin: number): { mode: PinMode; value: number } {
    if (!pins.has(pin)) {
      pins.set(pin, { mode: 'input', value: 0 });
    }
    return pins.get(pin)!;
  }

  return {
    pinMode(pin: number, mode: PinMode): void {
      if (!MODE_MAP[mode]) {
        throw new Error(`Invalid pin mode: ${mode}`);
      }
      const state = ensurePin(pin);
      state.mode = mode;
      if (mode === 'input_pullup') {
        state.value = 1;
      }
    },

    digitalRead(pin: number): number {
      const state = ensurePin(pin);
      return state.value ? 1 : 0;
    },

    digitalWrite(pin: number, value: number): void {
      const state = ensurePin(pin);
      state.value = value ? 1 : 0;
    },

    getPinState(pin: number): { mode: PinMode; value: number } {
      const state = ensurePin(pin);
      return { mode: state.mode, value: state.value };
    },

    getAllPins(): Map<number, { mode: PinMode; value: number }> {
      const copy = new Map<number, { mode: PinMode; value: number }>();
      for (const [pin, state] of pins) {
        copy.set(pin, { mode: state.mode, value: state.value });
      }
      return copy;
    },

    reset(): void {
      pins.clear();
    },
  };
}
