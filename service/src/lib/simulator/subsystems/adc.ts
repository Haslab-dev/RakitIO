export interface ADCSubsystem {
  read(pin: number): number;
  setResolution(bits: number): void;
  setReference(ref: 'default' | 'internal' | 'external'): void;
  setPinValue(pin: number, value: number): void;
  reset(): void;
}

const A0 = 14;
const A15 = 29;

function isAnalogPin(pin: number): boolean {
  return pin >= A0 && pin <= A15;
}

function toAnalogChannel(pin: number): number {
  if (isAnalogPin(pin)) {
    return pin - A0;
  }
  return pin;
}

export function createADC(): ADCSubsystem {
  const pinValues = new Map<number, number>();
  let resolution = 10;
  let reference: 'default' | 'internal' | 'external' = 'default';
  let maxValue = (1 << resolution) - 1;

  function clamp(value: number): number {
    return Math.max(0, Math.min(maxValue, Math.round(value)));
  }

  return {
    read(pin: number): number {
      const channel = toAnalogChannel(pin);
      const raw = pinValues.get(channel);
      if (raw === undefined) {
        return 0;
      }
      const scaled = Math.round((raw / 1023) * maxValue);
      return clamp(scaled);
    },

    setResolution(bits: number): void {
      if (bits < 1 || bits > 16) {
        throw new Error(`Invalid ADC resolution: ${bits} bits`);
      }
      resolution = bits;
      maxValue = (1 << bits) - 1;
    },

    setReference(ref: 'default' | 'internal' | 'external'): void {
      reference = ref;
    },

    setPinValue(pin: number, value: number): void {
      const channel = toAnalogChannel(pin);
      pinValues.set(channel, clamp(value));
    },

    reset(): void {
      pinValues.clear();
      resolution = 10;
      maxValue = 1023;
      reference = 'default';
    },
  };
}
