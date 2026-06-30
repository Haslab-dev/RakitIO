export interface PWMSubsystem {
  write(pin: number, duty: number): void;
  writeFrequency(pin: number, frequency: number): void;
  read(pin: number): { duty: number; frequency: number };
  reset(): void;
}

export function createPWM(): PWMSubsystem {
  const pinState = new Map<number, { duty: number; frequency: number }>();

  function ensurePin(pin: number): { duty: number; frequency: number } {
    if (!pinState.has(pin)) {
      pinState.set(pin, { duty: 0, frequency: 490 });
    }
    return pinState.get(pin)!;
  }

  function clampDuty(duty: number): number {
    return Math.max(0, Math.min(255, Math.round(duty)));
  }

  function clampFrequency(freq: number): number {
    return Math.max(1, Math.round(freq));
  }

  return {
    write(pin: number, duty: number): void {
      const state = ensurePin(pin);
      state.duty = clampDuty(duty);
    },

    writeFrequency(pin: number, frequency: number): void {
      const state = ensurePin(pin);
      state.frequency = clampFrequency(frequency);
    },

    read(pin: number): { duty: number; frequency: number } {
      const state = ensurePin(pin);
      return { duty: state.duty, frequency: state.frequency };
    },

    reset(): void {
      pinState.clear();
    },
  };
}
