export interface SPIDevice {
  csPin: number;
  onTransfer?(data: number): number;
}

export interface SPISubsystem {
  begin(): void;
  transfer(data: number): number;
  beginTransaction(settings: { clockSpeed: number; bitOrder: 'MSBFIRST' | 'LSBFIRST'; mode: 0 | 1 | 2 | 3 }): void;
  endTransaction(): void;
  registerDevice(device: SPIDevice): void;
  unregisterDevice(csPin: number): void;
  reset(): void;
}

interface SPISettings {
  clockSpeed: number;
  bitOrder: 'MSBFIRST' | 'LSBFIRST';
  mode: 0 | 1 | 2 | 3;
}

const DEFAULT_SETTINGS: SPISettings = {
  clockSpeed: 4000000,
  bitOrder: 'MSBFIRST',
  mode: 0,
};

export function createSPI(): SPISubsystem {
  const devices = new Map<number, SPIDevice>();
  let isInitialized = false;
  let currentSettings: SPISettings = { ...DEFAULT_SETTINGS };
  let activeDevice: SPIDevice | null = null;
  let activeCsPin = -1;

  function reverseBits(value: number, bits: number): number {
    let result = 0;
    for (let i = 0; i < bits; i++) {
      result = (result << 1) | ((value >> i) & 1);
    }
    return result;
  }

  function applyBitOrder(data: number): number {
    if (currentSettings.bitOrder === 'LSBFIRST') {
      return reverseBits(data, 8);
    }
    return data;
  }

  return {
    begin(): void {
      isInitialized = true;
    },

    transfer(data: number): number {
      if (!isInitialized) {
        throw new Error('SPI not initialized. Call begin() first.');
      }

      const ordered = applyBitOrder(data & 0xff);

      if (activeDevice && activeDevice.onTransfer) {
        const response = activeDevice.onTransfer(ordered);
        return applyBitOrder(response & 0xff);
      }

      return 0;
    },

    beginTransaction(settings: { clockSpeed: number; bitOrder: 'MSBFIRST' | 'LSBFIRST'; mode: 0 | 1 | 2 | 3 }): void {
      if (!isInitialized) {
        throw new Error('SPI not initialized. Call begin() first.');
      }
      currentSettings = { ...settings };

      for (const [csPin, device] of devices) {
        activeDevice = device;
        activeCsPin = csPin;
        break;
      }
    },

    endTransaction(): void {
      activeDevice = null;
      activeCsPin = -1;
      currentSettings = { ...DEFAULT_SETTINGS };
    },

    registerDevice(device: SPIDevice): void {
      devices.set(device.csPin, device);
    },

    unregisterDevice(csPin: number): void {
      devices.delete(csPin);
    },

    reset(): void {
      devices.clear();
      isInitialized = false;
      currentSettings = { ...DEFAULT_SETTINGS };
      activeDevice = null;
      activeCsPin = -1;
    },
  };
}
