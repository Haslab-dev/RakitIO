import type { Interpreter } from '../../vm/interpreter';
import type { NetlistSolver } from '../netlist';
import type { VirtualBusSystem } from '../bus';
import type { DevicePlugin, DeviceContext } from '../../sdk/device';

export interface SchedulerConfig {
  speed: number; // 0.25 to 4.0
  tickIntervalMs: number; // e.g. 10ms real-time per loop tick
}

export class SimulationScheduler {
  private interpreter: Interpreter;
  private netlist: NetlistSolver;
  private bus: VirtualBusSystem;
  private devices = new Map<string, { plugin: DevicePlugin; context: DeviceContext }>();
  
  private simTimeMs = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private paused = false;
  private config: SchedulerConfig = { speed: 1.0, tickIntervalMs: 20 };
  
  private onSnapshotCallback?: (snapshot: any) => void;

  constructor(interpreter: Interpreter, netlist: NetlistSolver, bus: VirtualBusSystem) {
    this.interpreter = interpreter;
    this.netlist = netlist;
    this.bus = bus;
  }

  public setOnSnapshot(callback: (snapshot: any) => void) {
    this.onSnapshotCallback = callback;
  }

  public registerDevice(id: string, plugin: DevicePlugin) {
    const context: DeviceContext = {
      id,
      readPin: (pinId) => {
        return this.netlist.getPin(id, pinId)?.value ?? 0;
      },
      writePin: (pinId, value) => {
        // Find pin mode (usually OUTPUT or ANALOG for driving sensors)
        const mode = pinId.toLowerCase().includes('wiper') || pinId.toLowerCase().includes('analog') ? 'ANALOG' : 'OUTPUT';
        this.netlist.updatePin(id, pinId, mode, value);
      },
      emitEvent: (_type, _payload) => {
        // Can send custom events to UI
      }
    };
    plugin.onMount(context);
    this.devices.set(id, { plugin, context });
    this.bus.registerDevice(id, plugin);
    
    // Register on I2C bus if it's an I2C device
    if (id.startsWith('bme280')) {
      this.bus.registerI2cDevice(0x76, plugin);
    } else if (id.startsWith('oled') || id.startsWith('ssd1306')) {
      this.bus.registerI2cDevice(0x3C, plugin);
    }
  }

  public start() {
    this.stop();
    this.simTimeMs = 0;
    this.running = true;
    this.paused = false;
    this.interpreter.start();
    this.runLoop();
  }

  public stop() {
    this.running = false;
    this.paused = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public pause() {
    this.paused = true;
  }

  public resume() {
    this.paused = false;
  }

  public setSpeed(speed: number) {
    this.config.speed = speed;
  }

  private runLoop() {
    this.timer = setInterval(() => {
      if (!this.running || this.paused) return;

      // Advance simulated time based on speed
      const realDelta = (this.config as any).tickIntervalMs ?? 20;
      const simDelta = realDelta * this.config.speed;
      this.simTimeMs += simDelta;

      // 1. Tick all registered devices
      for (const { plugin } of this.devices.values()) {
        plugin.onTick(simDelta);
      }

      // 2. Resolve button press dynamic connections in netlist
      this.netlist.clearDynamicConnections();
      for (const [id, { plugin }] of this.devices.entries()) {
        if (id.startsWith('button') && (plugin as any).pressed) {
          this.netlist.addDynamicConnection(
            { componentId: id, pinId: 'pin1' },
            { componentId: id, pinId: 'pin2' }
          );
        }
      }

      // 3. Step the VM interpreter (run multiple instructions to simulate clock speed)
      let instructionsExecuted = 0;
      const maxInstructionsPerTick = 1000 * this.config.speed;
      
      let hitBreakpoint = false;
      let currentLine: number | undefined;

      while (instructionsExecuted < maxInstructionsPerTick) {
        const stepResult = this.interpreter.step(this.simTimeMs);
        if (stepResult.hitBreakpoint) {
          hitBreakpoint = true;
          currentLine = stepResult.currentLine;
          this.pause();
          break;
        }
        instructionsExecuted++;
      }

      // 4. Solve the netlist to calculate final voltages
      const { nets, conflicts } = this.netlist.solve();

      // 5. Emit state snapshot to main thread
      if (this.onSnapshotCallback) {
        this.onSnapshotCallback({
          simTimeMs: this.simTimeMs,
          nets: nets.map(n => ({
            id: n.id,
            state: n.state,
            voltage: n.voltage,
            pins: n.pins.map(p => ({ componentId: p.componentId, pinId: p.pinId, value: p.value }))
          })),
          conflicts,
          variables: this.interpreter.getVariables(),
          callStack: this.interpreter.getCallStack(),
          componentStates: this.getDeviceStates(),
          hitBreakpoint,
          currentLine,
        });
      }
    }, (this.config as any).tickIntervalMs ?? 20);
  }

  private getDeviceStates(): Record<string, any> {
    const states: Record<string, any> = {};
    for (const [id, { plugin }] of this.devices.entries()) {
      const p = plugin as any;
      const className = plugin.constructor.name;
      if (className === 'VirtualLED' || p.on !== undefined) {
        states[id] = { on: p.on };
      } else if (className === 'VirtualButton' || p.pressed !== undefined) {
        states[id] = { pressed: p.pressed };
      } else if (className === 'VirtualPotentiometer' || p.position !== undefined) {
        states[id] = { position: p.position };
      } else if (className === 'VirtualOLED' || p.text !== undefined) {
        states[id] = { text: p.text };
      } else if (className === 'VirtualServo' || p.angle !== undefined) {
        states[id] = { angle: p.angle };
      } else if (className === 'VirtualBME280' || (p.pressure !== undefined && p.temperature !== undefined)) {
        states[id] = { temperature: p.temperature, humidity: p.humidity, pressure: p.pressure };
      } else if (p.temperature !== undefined && p.humidity !== undefined) {
        states[id] = { temperature: p.temperature, humidity: p.humidity };
      }
    }
    return states;
  }

  public handleDeviceInteraction(deviceId: string, property: string, value: any) {
    const device = this.devices.get(deviceId);
    if (device) {
      (device.plugin as any)[property] = value;
    }
  }
}
