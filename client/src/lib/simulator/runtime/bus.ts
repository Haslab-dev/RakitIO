import type { DevicePlugin } from '../sdk/device';

export class VirtualBusSystem {
  private i2cDevices = new Map<number, DevicePlugin>();
  private devices = new Map<string, DevicePlugin>();
  private activeI2cAddress: number | null = null;
  private i2cBuffer: number[] = [];
  private i2cReadBuffer: number[] = [];
  private serialListeners: ((text: string) => void)[] = [];
  private pinListeners = new Map<string, ((value: number) => void)[]>();

  constructor() {}

  public registerDevice(id: string, device: DevicePlugin) {
    this.devices.set(id, device);
  }

  public getDevices(): Map<string, DevicePlugin> {
    return this.devices;
  }

  // --- GPIO / Pin Listeners ---
  
  public addPinListener(componentId: string, pinId: string, callback: (value: number) => void) {
    const key = `${componentId}:${pinId}`;
    if (!this.pinListeners.has(key)) {
      this.pinListeners.set(key, []);
    }
    this.pinListeners.get(key)!.push(callback);
  }

  public triggerPinChange(componentId: string, pinId: string, value: number) {
    const key = `${componentId}:${pinId}`;
    const listeners = this.pinListeners.get(key);
    if (listeners) {
      for (const cb of listeners) {
        cb(value);
      }
    }
  }

  // --- I2C Bus ---

  public registerI2cDevice(address: number, device: DevicePlugin) {
    this.i2cDevices.set(address, device);
  }

  public wireBegin() {
    this.activeI2cAddress = null;
    this.i2cBuffer = [];
    this.i2cReadBuffer = [];
  }

  public wireBeginTransmission(address: number) {
    this.activeI2cAddress = address;
    this.i2cBuffer = [];
  }

  public wireWrite(value: number) {
    this.i2cBuffer.push(value);
  }

  public wireEndTransmission(): number {
    if (this.activeI2cAddress === null) return 4; // Error: no address

    const device = this.i2cDevices.get(this.activeI2cAddress);
    if (!device || !device.onI2C) {
      return 2; // NACK: address not found
    }

    // Send the write event
    for (const byte of this.i2cBuffer) {
      device.onI2C({
        type: 'write',
        address: this.activeI2cAddress,
        data: byte,
      });
    }

    // Trigger stop event
    device.onI2C({
      type: 'stop',
      address: this.activeI2cAddress,
    });

    return 0; // Success (ACK)
  }

  public wireRequestFrom(address: number, quantity: number): number {
    this.activeI2cAddress = address;
    this.i2cReadBuffer = [];

    const device = this.i2cDevices.get(address);
    if (!device || !device.onI2C) {
      return 0; // Return 0 bytes if device not found
    }

    for (let i = 0; i < quantity; i++) {
      const val = device.onI2C({
        type: 'read',
        address,
      });
      if (val !== undefined && typeof val === 'number') {
        this.i2cReadBuffer.push(val);
      } else {
        this.i2cReadBuffer.push(0);
      }
    }

    return this.i2cReadBuffer.length;
  }

  public wireRead(): number {
    if (this.i2cReadBuffer.length === 0) return -1;
    return this.i2cReadBuffer.shift()!;
  }

  // --- UART / Serial Monitor ---

  public addSerialListener(callback: (text: string) => void) {
    this.serialListeners.push(callback);
  }

  public writeSerial(text: string) {
    for (const cb of this.serialListeners) {
      cb(text);
    }
  }
}
