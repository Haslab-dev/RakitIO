import type {
  SimulationState,
  SimulationEvent,
  SimulationConfig,
  SimulationSnapshot,
} from '../shared';
import { createRuntime, INPUT, OUTPUT, HIGH, LOW } from '../runtime';
import {
  createSubsystems,
  type SimulationSubsystems,
  type GPIOSubsystem,
  type ADCSubsystem,
  type PWMSubsystem,
  type UARTSubsystem,
  type I2CSubsystem,
  type SPISubsystem,
  type ClockSubsystem,
  type Scheduler,
} from './subsystems';

export type {
  SimulationSubsystems,
  GPIOSubsystem,
  ADCSubsystem,
  PWMSubsystem,
  UARTSubsystem,
  I2CSubsystem,
  SPISubsystem,
  ClockSubsystem,
  Scheduler,
};

export { createSubsystems } from './subsystems';

export interface Simulator {
  state: SimulationState;
  config: SimulationConfig;
  subsystems: SimulationSubsystems;
  load(code: string): void;
  start(): void;
  pause(): void;
  resume(): void;
  step(): void;
  reset(): void;
  getSnapshot(): SimulationSnapshot;
  getEvents(): SimulationEvent[];
  getSerialOutput(): string[];
  setPinValue(pin: string, value: number): void;
  onEvent(callback: (event: SimulationEvent) => void): void;
  destroy(): void;
}

const DEFAULT_CONFIG: SimulationConfig = {
  speed: 1,
  maxCyclesPerTick: 1000,
  enableSerialMonitor: true,
  enableDebugging: false,
};

interface PinState {
  digital: number;
  analog: number;
  pwm: { duty: number; frequency: number } | null;
  mode: number;
}

export function createSimulator(config?: Partial<SimulationConfig>): Simulator {
  const resolvedConfig: SimulationConfig = { ...DEFAULT_CONFIG, ...config };
  const subsystems = createSubsystems();
  let state: SimulationState = 'idle';
  let code = '';
  let cycle = 0;
  let microseconds = 0;
  let tickTimer: ReturnType<typeof setTimeout> | null = null;
  let isDestroyed = false;

  const events: SimulationEvent[] = [];
  const serialOutput: string[] = [];
  const pinStates = new Map<string, PinState>();
  const componentStates = new Map<string, Record<string, unknown>>();
  const eventCallbacks: Array<(event: SimulationEvent) => void> = [];

  function getPinState(pin: string): PinState {
    if (!pinStates.has(pin)) {
      pinStates.set(pin, {
        digital: LOW,
        analog: 0,
        pwm: null,
        mode: INPUT,
      });
    }
    return pinStates.get(pin)!;
  }

  function emitEvent(event: SimulationEvent): void {
    events.push(event);
    for (const cb of eventCallbacks) {
      try {
        cb(event);
      } catch {
        // swallow callback errors to keep simulation running
      }
    }
  }

  function runtimeCallback(event: string, data: unknown): void {
    const d = data as Record<string, unknown>;

    switch (event) {
      case 'gpio:mode': {
        const pin = String(d.pin);
        const pinNum = d.pin as number;
        const ps = getPinState(pin);
        ps.mode = d.mode as number;

        const modeMap: Record<number, string> = {
          [INPUT]: 'input',
          [OUTPUT]: 'output',
          2: 'input_pullup',
        };
        subsystems.gpio.pinMode(pinNum, (modeMap[d.mode as number] ?? 'input') as 'input' | 'output' | 'input_pullup');
        break;
      }
      case 'gpio:write': {
        const pin = String(d.pin);
        const pinNum = d.pin as number;
        const value = d.value as number;
        const ps = getPinState(pin);
        ps.digital = value;
        ps.analog = value ? 1023 : 0;
        subsystems.gpio.digitalWrite(pinNum, value);
        emitEvent({ type: 'gpio:write', pin, value });
        break;
      }
      case 'gpio:read': {
        const pin = String(d.pin);
        const pinNum = d.pin as number;
        const ps = getPinState(pin);
        subsystems.gpio.digitalRead(pinNum);
        emitEvent({ type: 'gpio:read', pin, value: ps.digital });
        break;
      }
      case 'adc:read': {
        const pin = String(d.pin);
        const pinNum = d.pin as number;
        const ps = getPinState(pin);
        const adcValue = subsystems.adc.read(pinNum);
        ps.analog = adcValue;
        emitEvent({ type: 'adc:read', pin, value: ps.analog });
        break;
      }
      case 'pwm:write': {
        const pin = String(d.pin);
        const pinNum = d.pin as number;
        const duty = d.duty as number;
        const frequency = (d.frequency as number) ?? 490;
        const ps = getPinState(pin);
        ps.pwm = { duty, frequency };
        ps.analog = Math.round((duty / 255) * 1023);
        ps.digital = duty > 127 ? HIGH : LOW;
        subsystems.pwm.write(pinNum, duty);
        subsystems.pwm.writeFrequency(pinNum, frequency);
        emitEvent({ type: 'pwm:write', pin, duty, frequency });
        break;
      }
      case 'serial:print': {
        const text = d.text as string;
        serialOutput.push(text);
        subsystems.uart.print(0, text);
        emitEvent({ type: 'serial:print', text });
        break;
      }
      case 'delay': {
        const ms = (d.ms as number) ?? 0;
        subsystems.clock.advance(ms * 1000);
        emitEvent({ type: 'delay', ms });
        break;
      }
      case 'i2c:write': {
        const addr = d.address as number;
        subsystems.i2c.beginTransmission(addr);
        const reg = (d.register as number) ?? 0;
        const dataArr = (d.data as Uint8Array) ?? new Uint8Array();
        subsystems.i2c.write(reg);
        for (const byte of dataArr) {
          subsystems.i2c.write(byte);
        }
        subsystems.i2c.endTransmission();
        emitEvent({
          type: 'i2c:write',
          address: addr,
          register: reg,
          data: dataArr,
        });
        break;
      }
      case 'i2c:read': {
        const addr = d.address as number;
        const dataArr = (d.data as Uint8Array) ?? new Uint8Array();
        emitEvent({
          type: 'i2c:read',
          address: addr,
          register: (d.register as number) ?? 0,
          data: dataArr,
        });
        break;
      }
      case 'i2c:endTransmission': {
        const addr = d.address as number;
        const dataArr = (d.data as Uint8Array) ?? new Uint8Array();
        subsystems.i2c.endTransmission();
        emitEvent({
          type: 'i2c:write',
          address: addr,
          register: 0,
          data: dataArr,
        });
        break;
      }
      case 'i2c:requestFrom': {
        const addr = d.address as number;
        const count = (d.quantity as number) ?? (d.data as Uint8Array)?.length ?? 0;
        subsystems.i2c.requestFrom(addr, count);
        emitEvent({
          type: 'i2c:read',
          address: addr,
          register: 0,
          data: (d.data as Uint8Array) ?? new Uint8Array(),
        });
        break;
      }
      case 'spi:transfer': {
        const dataArr = (d.data as Uint8Array) ?? new Uint8Array();
        for (const byte of dataArr) {
          subsystems.spi.transfer(byte);
        }
        emitEvent({
          type: 'spi:transfer',
          data: dataArr,
        });
        break;
      }
    }
  }

  const runtime = createRuntime(runtimeCallback);

  function runTick(): void {
    if (state !== 'running' || isDestroyed) return;

    const cyclesThisTick = Math.max(1, Math.round(resolvedConfig.maxCyclesPerTick * resolvedConfig.speed));

    for (let i = 0; i < cyclesThisTick; i++) {
      cycle++;
      microseconds += 16;

      subsystems.clock.advance(16);
      subsystems.scheduler.tick();

      emitEvent({
        type: 'tick',
        cycle,
        microseconds,
      });
    }

    const delayMs = Math.max(1, Math.round(16 / resolvedConfig.speed));
    tickTimer = setTimeout(runTick, delayMs);
  }

  function stopTimer(): void {
    if (tickTimer !== null) {
      clearTimeout(tickTimer);
      tickTimer = null;
    }
  }

  const simulator: Simulator = {
    get state() {
      return state;
    },

    get config() {
      return resolvedConfig;
    },

    get subsystems() {
      return subsystems;
    },

    load(newCode: string): void {
      if (isDestroyed) throw new Error('Simulator has been destroyed');
      code = newCode;
      state = 'idle';
      stopTimer();
    },

    start(): void {
      if (isDestroyed) throw new Error('Simulator has been destroyed');
      if (state === 'running') return;

      state = 'running';
      subsystems.i2c.begin();
      subsystems.spi.begin();
      subsystems.uart.begin(0, 9600);
      subsystems.scheduler.start();
      runTick();
    },

    pause(): void {
      if (isDestroyed) throw new Error('Simulator has been destroyed');
      if (state !== 'running') return;

      state = 'paused';
      subsystems.scheduler.pause();
      stopTimer();
    },

    resume(): void {
      if (isDestroyed) throw new Error('Simulator has been destroyed');
      if (state !== 'paused') return;

      state = 'running';
      subsystems.scheduler.resume();
      runTick();
    },

    step(): void {
      if (isDestroyed) throw new Error('Simulator has been destroyed');

      state = 'stepping';
      cycle++;
      microseconds += 16;

      subsystems.clock.advance(16);
      subsystems.scheduler.tick();

      emitEvent({
        type: 'tick',
        cycle,
        microseconds,
      });

      state = 'paused';
    },

    reset(): void {
      if (isDestroyed) throw new Error('Simulator has been destroyed');

      stopTimer();
      state = 'idle';
      cycle = 0;
      microseconds = 0;
      events.length = 0;
      serialOutput.length = 0;
      pinStates.clear();
      componentStates.clear();

      subsystems.gpio.reset();
      subsystems.adc.reset();
      subsystems.pwm.reset();
      subsystems.uart.reset();
      subsystems.i2c.reset();
      subsystems.spi.reset();
      subsystems.clock.reset();
      subsystems.scheduler.reset();
    },

    getSnapshot(): SimulationSnapshot {
      const gpio: Record<string, number> = {};
      const analog: Record<string, number> = {};
      const pwm: Record<string, { duty: number; frequency: number }> = {};
      const components: Record<string, Record<string, unknown>> = {};

      for (const [pin, ps] of pinStates) {
        gpio[pin] = ps.digital;
        analog[pin] = ps.analog;
        if (ps.pwm) {
          pwm[pin] = ps.pwm;
        }
      }

      for (const [id, compState] of componentStates) {
        components[id] = { ...compState };
      }

      return {
        cycle,
        microseconds,
        gpio,
        analog,
        pwm,
        serial: [...serialOutput],
        components,
      };
    },

    getEvents(): SimulationEvent[] {
      return [...events];
    },

    getSerialOutput(): string[] {
      const uartOutput = subsystems.uart.getOutput(0);
      if (uartOutput.length > 0) {
        return [...serialOutput, ...uartOutput];
      }
      return [...serialOutput];
    },

    setPinValue(pin: string, value: number): void {
      if (isDestroyed) throw new Error('Simulator has been destroyed');

      const pinNum = parseInt(pin, 10);
      const ps = getPinState(pin);
      ps.analog = value;
      ps.digital = value > 512 ? HIGH : LOW;

      if (!isNaN(pinNum)) {
        subsystems.gpio.digitalWrite(pinNum, ps.digital);
        subsystems.adc.setPinValue(pinNum, value);
      }
    },

    onEvent(callback: (event: SimulationEvent) => void): void {
      eventCallbacks.push(callback);
    },

    destroy(): void {
      if (isDestroyed) return;
      isDestroyed = true;
      stopTimer();
      state = 'idle';
      events.length = 0;
      serialOutput.length = 0;
      pinStates.clear();
      componentStates.clear();
      eventCallbacks.length = 0;

      subsystems.gpio.reset();
      subsystems.adc.reset();
      subsystems.pwm.reset();
      subsystems.uart.reset();
      subsystems.i2c.reset();
      subsystems.spi.reset();
      subsystems.clock.reset();
      subsystems.scheduler.reset();
    },
  };

  return simulator;
}
