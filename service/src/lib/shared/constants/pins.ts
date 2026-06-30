import type { PinMode, PinState } from '../types/pin';

export const PIN_GROUPS = {
  digital: ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13'],
  analog: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'],
  power: ['VIN', 'GND', '5V', '3.3V', 'RESET', 'AREF'],
  communication: {
    serial: { tx: 'TX', rx: 'RX' },
    i2c: { sda: 'SDA', scl: 'SCL' },
    spi: { mosi: 'MOSI', miso: 'MISO', sck: 'SCK', cs: 'CS' },
  },
} as const;

export const PIN_MODE_DESCRIPTIONS: Record<PinMode, string> = {
  input: 'Read digital signals (HIGH/LOW)',
  output: 'Write digital signals (HIGH/LOW)',
  input_pullup: 'Read digital signals with internal pull-up resistor enabled',
  pwm: 'Write analog-like values using pulse-width modulation',
  analog: 'Read analog voltage levels (0–1023 or 0–4095)',
  serial: 'UART serial communication (TX/RX)',
  i2c: 'I²C two-wire serial bus (SDA/SCL)',
  spi: 'SPI four-wire serial bus (MOSI/MISO/SCK/CS)',
};

export const DEFAULT_PIN_STATES: Record<string, PinState> = {
  digital_low: {
    pinId: '',
    mode: 'output',
    value: 0,
    digitalValue: 0,
    analogValue: 0,
  },
  digital_high: {
    pinId: '',
    mode: 'output',
    value: 1,
    digitalValue: 1,
    analogValue: 1023,
  },
  analog_zero: {
    pinId: '',
    mode: 'analog',
    value: 0,
    digitalValue: 0,
    analogValue: 0,
  },
  analog_mid: {
    pinId: '',
    mode: 'analog',
    value: 512,
    digitalValue: 0,
    analogValue: 512,
  },
  analog_max: {
    pinId: '',
    mode: 'analog',
    value: 1023,
    digitalValue: 1,
    analogValue: 1023,
  },
  input_float: {
    pinId: '',
    mode: 'input',
    value: 0,
    digitalValue: 0,
    analogValue: 0,
  },
  input_pullup_high: {
    pinId: '',
    mode: 'input_pullup',
    value: 1,
    digitalValue: 1,
    analogValue: 1023,
  },
  pwm_zero: {
    pinId: '',
    mode: 'pwm',
    value: 0,
    digitalValue: 0,
    analogValue: 0,
  },
  pwm_half: {
    pinId: '',
    mode: 'pwm',
    value: 128,
    digitalValue: 0,
    analogValue: 512,
  },
  pwm_max: {
    pinId: '',
    mode: 'pwm',
    value: 255,
    digitalValue: 1,
    analogValue: 1023,
  },
};

export function createDefaultPinState(pinId: string, mode: PinMode = 'input'): PinState {
  return {
    pinId,
    mode,
    value: 0,
    digitalValue: 0,
    analogValue: 0,
  };
}
