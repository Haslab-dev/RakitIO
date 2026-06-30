export const INPUT = 0;
export const OUTPUT = 1;
export const INPUT_PULLUP = 2;
export const HIGH = 1;
export const LOW = 0;

interface PinState {
  mode: number;
  digitalValue: number;
  analogValue: number;
  pwmValue: number;
}

interface I2CState {
  address: number;
  buffer: number[];
  transmitting: boolean;
}

interface SPIState {
  buffer: number[];
  active: boolean;
}

interface SerialState {
  baudRate: number;
  rxBuffer: string[];
  output: string[];
}

export interface ArduinoRuntime {
  pinMode(pin: number, mode: number): void;
  digitalRead(pin: number): number;
  digitalWrite(pin: number, value: number): void;
  analogRead(pin: number): number;
  analogWrite(pin: number, value: number): void;
  delay(ms: number): void;
  delayMicroseconds(us: number): void;
  millis(): number;
  micros(): number;
  serialBegin(baudRate: number): void;
  serialPrint(data: string): void;
  serialPrintln(data: string): void;
  serialRead(): number;
  i2cBegin(): void;
  i2cBeginTransmission(address: number): void;
  i2cWrite(data: number): void;
  i2cEndTransmission(): number;
  i2cRequestFrom(address: number, quantity: number): number[];
  spiBegin(): void;
  spiTransfer(data: number): number;
  spiEnd(): void;
}

export type RuntimeEventCallback = (event: string, data: unknown) => void;

export function createRuntime(callback: RuntimeEventCallback): ArduinoRuntime {
  const pins = new Map<number, PinState>();
  const i2c: I2CState = { address: 0, buffer: [], transmitting: false };
  const spi: SPIState = { buffer: [], active: false };
  const serial: SerialState = { baudRate: 9600, rxBuffer: [], output: [] };
  let startTime = Date.now();

  function getPinState(pin: number): PinState {
    if (!pins.has(pin)) {
      pins.set(pin, {
        mode: INPUT,
        digitalValue: LOW,
        analogValue: 0,
        pwmValue: 0,
      });
    }
    return pins.get(pin)!;
  }

  function getPinInternal(pin: number): PinState {
    return getPinState(pin);
  }

  return {
    pinMode(pin: number, mode: number): void {
      const state = getPinInternal(pin);
      state.mode = mode;
      callback('gpio:mode', { pin, mode });
    },

    digitalRead(pin: number): number {
      const state = getPinInternal(pin);
      callback('gpio:read', { pin, value: state.digitalValue });
      return state.digitalValue;
    },

    digitalWrite(pin: number, value: number): void {
      const state = getPinInternal(pin);
      state.digitalValue = value ? HIGH : LOW;
      if (state.mode === OUTPUT) {
        state.analogValue = value ? 1023 : 0;
      }
      callback('gpio:write', { pin, value: state.digitalValue });
    },

    analogRead(pin: number): number {
      const state = getPinInternal(pin);
      callback('adc:read', { pin, value: state.analogValue });
      return state.analogValue;
    },

    analogWrite(pin: number, value: number): void {
      const state = getPinInternal(pin);
      state.pwmValue = Math.max(0, Math.min(255, value));
      state.analogValue = Math.round((state.pwmValue / 255) * 1023);
      state.digitalValue = state.pwmValue > 127 ? HIGH : LOW;
      callback('pwm:write', { pin, duty: state.pwmValue, frequency: 490 });
    },

    delay(ms: number): void {
      const elapsed = (Date.now() - startTime) + ms;
      callback('delay', { ms, elapsed });
    },

    delayMicroseconds(us: number): void {
      callback('delay', { us });
    },

    millis(): number {
      return Date.now() - startTime;
    },

    micros(): number {
      return (Date.now() - startTime) * 1000;
    },

    serialBegin(baudRate: number): void {
      serial.baudRate = baudRate;
      callback('serial:begin', { baudRate });
    },

    serialPrint(data: string): void {
      serial.output.push(data);
      callback('serial:print', { text: data });
    },

    serialPrintln(data: string): void {
      serial.output.push(data + '\n');
      callback('serial:print', { text: data + '\n' });
    },

    serialRead(): number {
      if (serial.rxBuffer.length === 0) {
        return -1;
      }
      const ch = serial.rxBuffer.shift()!;
      return ch.charCodeAt(0);
    },

    i2cBegin(): void {
      callback('i2c:begin', {});
    },

    i2cBeginTransmission(address: number): void {
      i2c.address = address;
      i2c.buffer = [];
      i2c.transmitting = true;
      callback('i2c:beginTransmission', { address });
    },

    i2cWrite(data: number): void {
      i2c.buffer.push(data & 0xff);
      callback('i2c:write', { address: i2c.address, data });
    },

    i2cEndTransmission(): number {
      i2c.transmitting = false;
      const data = new Uint8Array(i2c.buffer);
      callback('i2c:endTransmission', { address: i2c.address, data });
      i2c.buffer = [];
      return 0;
    },

    i2cRequestFrom(address: number, quantity: number): number[] {
      const data: number[] = new Array(quantity).fill(0);
      callback('i2c:requestFrom', { address, quantity, data: new Uint8Array(data) });
      return data;
    },

    spiBegin(): void {
      spi.active = true;
      spi.buffer = [];
      callback('spi:begin', {});
    },

    spiTransfer(data: number): number {
      spi.buffer.push(data);
      callback('spi:transfer', { data: new Uint8Array([data]) });
      return 0;
    },

    spiEnd(): void {
      spi.active = false;
      spi.buffer = [];
      callback('spi:end', {});
    },
  };
}
