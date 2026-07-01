/**
 * Device Context Interface
 *
 * Provides access to the simulation environment for device plugins.
 * Allows reading/writing pin values and emitting events to the UI.
 */
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

/**
 * Device Plugin Interface
 *
 * All virtual devices must implement this interface to work with the simulation engine.
 *
 * Lifecycle hooks:
 * - onMount(): Called when device is added to simulation. Use to initialize state.
 * - onTick(): Called every simulation tick. Update state based on pin values.
 * - onRender(): Called every render frame. Update SVG visuals.
 * - onDestroy(): Called when device is removed. Clean up resources.
 *
 * Optional hooks:
 * - onGPIO(): Handle GPIO pin change events
 * - onI2C(): Handle I2C bus communication (return read byte or ACK)
 * - onSPI(): Handle SPI communication
 * - onUART(): Handle UART/Serial communication
 * - onPWM(): Handle PWM duty cycle changes
 * - onNetwork(): Handle network events (future)
 *
 * Example:
 * ```typescript
 * export class MyDevice implements DevicePlugin {
 *   private ctx!: DeviceContext;
 *
 *   onMount(ctx: DeviceContext) {
 *     this.ctx = ctx;
 *   }
 *
 *   onTick() {
 *     const value = this.ctx.readPin('input');
 *     this.ctx.writePin('output', value * 2);
 *   }
 *
 *   onRender(renderer) {
 *     renderer.setStyle('.led', 'fill', 'green');
 *   }
 *
 *   onDestroy() {
 *     // Cleanup
 *   }
 * }
 * ```
 */
