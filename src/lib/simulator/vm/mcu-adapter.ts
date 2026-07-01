import type { MCUAdapter } from './interpreter';
import type { NetlistSolver } from '../runtime/netlist';
import type { VirtualBusSystem } from '../runtime/bus';

export class VirtualMCUAdapter implements MCUAdapter {
  private netlist: NetlistSolver;
  private bus: VirtualBusSystem;
  private boardId: string;
  private currentSimTimeMs = 0;

  constructor(netlist: NetlistSolver, bus: VirtualBusSystem, boardId: string) {
    this.netlist = netlist;
    this.bus = bus;
    this.boardId = boardId;
  }

  public setSimTime(timeMs: number) {
    this.currentSimTimeMs = timeMs;
  }

  // Maps Arduino pin number to physical pin ID on the board
  private mapPin(pin: number): string {
    if (this.boardId === 'arduino-uno') {
      if (pin >= 0 && pin <= 13) {
        return 'D' + pin;
      }
      // A0-A5 are mapped to 14-19 in the Arduino Uno core
      if (pin >= 14 && pin <= 19) {
        return 'A' + (pin - 14);
      }
    } else if (this.boardId === 'esp32-devkit-v1') {
      // ESP32 pins are named GPIOxx in our netlist/pins list
      return 'GPIO' + pin;
    }
    return String(pin);
  }

  // --- MCU Core APIs ---

  public pinMode(pin: number, mode: string) {
    const pinId = this.mapPin(pin);
    // Accept either Arduino mode strings or their numeric macro values
    // (INPUT=0, OUTPUT=1, INPUT_PULLUP=2, INPUT_PULLDOWN=3).
    let m: string;
    if (typeof mode === 'number') {
      m = mode === 1 ? 'OUTPUT' : mode === 2 ? 'INPUT_PULLUP' : mode === 3 ? 'INPUT_PULLDOWN' : 'INPUT';
    } else {
      m = mode === 'OUTPUT' ? 'OUTPUT' : mode === 'INPUT_PULLUP' ? 'INPUT_PULLUP' : mode === 'INPUT_PULLDOWN' ? 'INPUT_PULLDOWN' : 'INPUT';
    }
    this.netlist.updatePin('board', pinId, m as any, 0);
    this.netlist.solve();
  }

  public digitalWrite(pin: number, value: number) {
    const pinId = this.mapPin(pin);
    const highVoltage = this.boardId === 'arduino-uno' ? 5.0 : 3.3;
    const voltage = value === 1 ? highVoltage : 0.0;
    this.netlist.updatePin('board', pinId, 'OUTPUT', voltage);
    
    // Solve netlist to propagate change
    this.netlist.solve();
    
    // Notify bus listeners
    this.bus.triggerPinChange('board', pinId, voltage);
  }

  public digitalRead(pin: number): number {
    const pinId = this.mapPin(pin);
    // Ensure it is configured
    const existing = this.netlist.getPin('board', pinId);
    if (!existing) {
      this.netlist.registerPin('board', pinId, 'INPUT', 0);
      this.netlist.solve();
    }
    const val = this.netlist.getPin('board', pinId)?.value ?? 0;
    return val >= 1.5 ? 1 : 0;
  }

  public analogWrite(pin: number, value: number) {
    const pinId = this.mapPin(pin);
    // Map 0-255 duty cycle to 0.0-3.3V
    const voltage = (value / 255) * 3.3;
    this.netlist.updatePin('board', pinId, 'OUTPUT', voltage);
    this.netlist.solve();
    this.bus.triggerPinChange('board', pinId, voltage);
  }

  public analogRead(pin: number): number {
    const pinId = this.mapPin(pin);
    const existing = this.netlist.getPin('board', pinId);
    if (!existing) {
      this.netlist.registerPin('board', pinId, 'ANALOG', 0);
      this.netlist.solve();
    }
    // Convert voltage to a 10-bit ADC value using the board's reference voltage
    const refVoltage = this.boardId === 'arduino-uno' ? 5.0 : 3.3;
    const voltage = this.netlist.getPin('board', pinId)?.value ?? 0;
    return Math.max(0, Math.min(1023, Math.round((voltage / refVoltage) * 1023)));
  }

  public millis(): number {
    return this.currentSimTimeMs;
  }

  public micros(): number {
    return this.currentSimTimeMs * 1000;
  }

  public serialWrite(text: string) {
    this.bus.writeSerial(text);
  }

  // --- I2C Bus ---

  public wireBegin() {
    this.bus.wireBegin();
  }

  public wireBeginTransmission(address: number) {
    this.bus.wireBeginTransmission(address);
  }

  public wireWrite(value: number) {
    this.bus.wireWrite(value);
  }

  public wireEndTransmission(): number {
    return this.bus.wireEndTransmission();
  }

  public wireRequestFrom(address: number, quantity: number): number {
    return this.bus.wireRequestFrom(address, quantity);
  }

  public wireRead(): number {
    return this.bus.wireRead();
  }

  // --- Servo Control ---

  public servoWrite(pin: number, angle: number) {
    const pinId = this.mapPin(pin);
    this.netlist.updatePin('board', pinId, 'OUTPUT', angle);
    this.netlist.solve();
    this.bus.triggerPinChange('board', pinId, angle);
  }

  // --- DHT Sensor ---

  private findDhtDevice(): any | null {
    for (const [id, dev] of this.bus.getDevices().entries()) {
      const d = dev as any;
      // Match by component id prefix, an explicit sensor alias, or by the
      // presence of both temperature & humidity fields (robust to constructor
      // name minification in production builds).
      if (
        id.startsWith('dht') ||
        id === 'sensor' ||
        (d.temperature !== undefined && d.humidity !== undefined)
      ) {
        return d;
      }
    }
    return null;
  }

  public dhtReadTemperature(): number {
    const dev = this.findDhtDevice();
    return dev?.temperature ?? 24.0;
  }

  public dhtReadHumidity(): number {
    const dev = this.findDhtDevice();
    return dev?.humidity ?? 60.0;
  }

  // --- Pulse Measurement ---

  public pulseIn(pin: number, state: 'HIGH' | 'LOW' = 'HIGH', _timeout: number = 1000000): number {
    const pinId = this.mapPin(pin);
    const threshold = state === 'HIGH' ? 1.5 : 0.5;

    // Find HC-SR04 or similar device connected to this pin
    const devices = this.bus.getDevices();
    for (const [_id, dev] of devices.entries()) {
      const d = dev as any;
      if (d.distance !== undefined && d.lastTrigTime !== undefined) {
        if (d.lastTrigTime > 0 && d.distance > 0) {
          // Return the measured pulse width based on distance
          const pulseWidthUs = (d.distance * 2 / 0.034) * 1000;
          return Math.round(pulseWidthUs);
        }
      }
    }

    // Fallback: simulate pulse based on current pin state
    const pinData = this.netlist.getPin('board', pinId);
    const currentValue = pinData?.value ?? 0;

    if (currentValue >= threshold) {
      // Pin is already in the requested state, return a simulated pulse width
      // For simulation, return a fixed value representing a valid pulse
      return 150; // 150 microseconds
    }

    return 0; // Timeout or no pulse detected
  }

  // --- Tone (Buzzer/Speaker) ---

  private activeTones = new Map<number, number>();

  public tone(pin: number, frequency: number = 440): void {
    this.activeTones.set(pin, frequency);
    // Trigger buzzer device if connected
    const devices = this.bus.getDevices();
    for (const [_id, dev] of devices.entries()) {
      const d = dev as any;
      if (d.frequency !== undefined) {
        d.frequency = frequency;
        d.active = true;
      }
    }
  }

  public noTone(pin: number): void {
    this.activeTones.delete(pin);
    // Stop buzzer device if connected
    const devices = this.bus.getDevices();
    for (const [_id, dev] of devices.entries()) {
      const d = dev as any;
      if (d.frequency !== undefined) {
        d.active = false;
      }
    }
  }

  // --- Interrupts ---

  private interruptHandlers = new Map<number, { mode: string; handler: () => void }>();

  public attachInterrupt(pin: number, mode: string, handler: () => void): void {
    this.interruptHandlers.set(pin, { mode, handler });
  }

  public detachInterrupt(pin: number): void {
    this.interruptHandlers.delete(pin);
  }

  public triggerInterrupt(pin: number): void {
    const handler = this.interruptHandlers.get(pin);
    if (handler) {
      handler.handler();
    }
  }
}
