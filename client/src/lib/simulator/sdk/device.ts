export interface DeviceContext {
  id: string;
  readPin(pinId: string): number;
  writePin(pinId: string, value: number): void;
  emitEvent(type: string, payload: any): void;
}

export interface GPIOEvent {
  pinId: string;
  value: number;
}

export interface I2CEvent {
  type: 'start' | 'stop' | 'write' | 'read';
  address?: number;
  data?: number;
}

export interface RendererContext {
  select(selector: string): any;
  setAttribute(selector: string, name: string, value: string): void;
  setStyle(selector: string, name: string, value: string): void;
  setText(selector: string, text: string): void;
}

export interface DevicePlugin {
  onMount(ctx: DeviceContext): void;
  onTick(deltaMs: number): void;
  onGPIO?(event: GPIOEvent): void;
  onI2C?(event: I2CEvent): number | void; // Returns ACK/NACK or read byte
  onSPI?(data: number): number;
  onUART?(data: string): void;
  onPWM?(pinId: string, dutyCycle: number): void;
  onNetwork?(event: any): void;
  onRender(renderer: RendererContext): void;
  onDestroy(): void;
}
