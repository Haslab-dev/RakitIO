export interface I2CDevice {
  address: number;
  registers: Map<number, number>;
  onWrite?(address: number, register: number, data: number[]): void;
  onRead?(address: number, register: number, count: number): number[];
}

export interface I2CSubsystem {
  begin(): void;
  beginTransmission(address: number): void;
  write(data: number): void;
  endTransmission(): number;
  requestFrom(address: number, count: number): number[];
  registerDevice(device: I2CDevice): void;
  unregisterDevice(address: number): void;
  getDevices(): I2CDevice[];
  reset(): void;
}

function createDefaultDevice(address: number, name: string): I2CDevice {
  const registers = new Map<number, number>();

  switch (name) {
    case 'BME280':
      registers.set(0xD0, 0x60);
      registers.set(0xF2, 0x00);
      registers.set(0xF4, 0x00);
      registers.set(0xF5, 0x00);
      registers.set(0xFA, 0x80);
      registers.set(0xFB, 0x00);
      registers.set(0xFC, 0x00);
      registers.set(0xFD, 0x00);
      registers.set(0xFE, 0x00);
      registers.set(0xFF, 0x00);
      break;
    case 'SSD1306':
      registers.set(0x00, 0x00);
      break;
    case 'MPU6050':
      registers.set(0x75, 0x68);
      registers.set(0x6B, 0x00);
      registers.set(0x19, 0x07);
      registers.set(0x1A, 0x06);
      registers.set(0x1B, 0x00);
      registers.set(0x1C, 0x00);
      registers.set(0x3B, 0x00);
      registers.set(0x3C, 0x00);
      registers.set(0x3D, 0x00);
      registers.set(0x3E, 0x00);
      registers.set(0x3F, 0x00);
      registers.set(0x40, 0x00);
      registers.set(0x41, 0x00);
      registers.set(0x42, 0x00);
      break;
    case 'DS3231':
      registers.set(0x00, 0x00);
      registers.set(0x01, 0x00);
      registers.set(0x02, 0x00);
      registers.set(0x03, 0x00);
      registers.set(0x04, 0x00);
      registers.set(0x05, 0x00);
      registers.set(0x06, 0x00);
      registers.set(0x0E, 0x00);
      registers.set(0x0F, 0x00);
      break;
    case 'BH1750':
      registers.set(0x00, 0x00);
      break;
  }

  return {
    address,
    registers,
    onWrite(address, register, data) {
      for (let i = 0; i < data.length; i++) {
        registers.set(register + i, data[i]);
      }
    },
    onRead(address, register, count) {
      const result: number[] = [];
      for (let i = 0; i < count; i++) {
        result.push(registers.get(register + i) ?? 0);
      }
      return result;
    },
  };
}

export function createI2C(): I2CSubsystem {
  const devices = new Map<number, I2CDevice>();
  let txAddress = 0;
  let txBuffer: number[] = [];
  let rxBuffer: number[] = [];
  let isInitialized = false;

  function findDevice(address: number): I2CDevice | undefined {
    return devices.get(address);
  }

  const defaultDevices: Array<{ address: number; name: string }> = [
    { address: 0x76, name: 'BME280' },
    { address: 0x77, name: 'BME280' },
    { address: 0x3C, name: 'SSD1306' },
    { address: 0x68, name: 'MPU6050' },
    { address: 0x23, name: 'BH1750' },
  ];

  return {
    begin(): void {
      isInitialized = true;
      for (const def of defaultDevices) {
        if (!devices.has(def.address)) {
          devices.set(def.address, createDefaultDevice(def.address, def.name));
        }
      }
    },

    beginTransmission(address: number): void {
      if (!isInitialized) {
        throw new Error('I2C not initialized. Call begin() first.');
      }
      txAddress = address;
      txBuffer = [];
    },

    write(data: number): void {
      txBuffer.push(data & 0xff);
    },

    endTransmission(): number {
      const device = findDevice(txAddress);
      if (!device) {
        txBuffer = [];
        return 2;
      }

      if (device.onWrite && txBuffer.length > 0) {
        const register = txBuffer[0];
        const data = txBuffer.slice(1);
        device.onWrite(txAddress, register, data);
      }

      const result = 0;
      txBuffer = [];
      return result;
    },

    requestFrom(address: number, count: number): number[] {
      const device = findDevice(address);
      if (!device) {
        return new Array(count).fill(0);
      }

      if (device.onRead) {
        const lastRegister = txBuffer.length > 0 ? txBuffer[0] : 0;
        rxBuffer = device.onRead(address, lastRegister, count);
      } else {
        rxBuffer = new Array(count).fill(0);
        for (let i = 0; i < count; i++) {
          const reg = (txBuffer.length > 0 ? txBuffer[0] : 0) + i;
          if (device.registers.has(reg)) {
            rxBuffer[i] = device.registers.get(reg)!;
          }
        }
      }

      return [...rxBuffer];
    },

    registerDevice(device: I2CDevice): void {
      devices.set(device.address, device);
    },

    unregisterDevice(address: number): void {
      devices.delete(address);
    },

    getDevices(): I2CDevice[] {
      return [...devices.values()];
    },

    reset(): void {
      devices.clear();
      txBuffer = [];
      rxBuffer = [];
      txAddress = 0;
      isInitialized = false;
    },
  };
}
