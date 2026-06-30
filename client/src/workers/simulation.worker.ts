import { parse } from '../lib/simulator/frontend/tree-sitter';
import { adapt } from '../lib/simulator/frontend/ast-adapter';
import { IRBuilder } from '../lib/simulator/frontend/ir-builder';
import { Interpreter } from '../lib/simulator/vm/interpreter';
import { NetlistSolver } from '../lib/simulator/runtime/netlist';
import { VirtualBusSystem } from '../lib/simulator/runtime/bus';
import { VirtualMCUAdapter } from '../lib/simulator/vm/mcu-adapter';
import { SimulationScheduler } from '../lib/simulator/runtime/Scheduler/scheduler';
import { DeviceRegistry } from '../lib/simulator/sdk/registry';

interface StartPayload {
  code: string;
  components: Array<{ id: string; definitionId: string; properties?: Record<string, unknown> }>;
  wires: Array<{
    from: { componentId: string; pinId: string };
    to: { componentId: string; pinId: string };
  }>;
  boardId: string;
  config?: {
    speed?: number;
    breakpoints?: number[];
  };
}

let scheduler: SimulationScheduler | null = null;
let mcuAdapter: VirtualMCUAdapter | null = null;

function postMessage(msg: any) {
  self.postMessage(msg);
}

function startSimulation(payload: StartPayload) {
  try {
    if (scheduler) {
      scheduler.stop();
      scheduler = null;
    }

    // 1. Compile C++ to Rakit Instruction Set (RIS)
    const syntaxTree = parse(payload.code);
    const uniformAST = adapt(syntaxTree);
    const irBuilder = new IRBuilder();
    const compiledProgram = irBuilder.compile(uniformAST);

    // 2. Initialize Hardware & Netlist
    const netlist = new NetlistSolver();
    const bus = new VirtualBusSystem();

    // Register Board Pins in Netlist
    const boardId = payload.boardId || 'esp32-devkit-v1';

    // Set up wires
    const wiresList = payload.wires.map(w => {
      const fromId = w.from?.componentId || (w as any).sourceComponentId;
      const fromPin = w.from?.pinId || (w as any).sourcePinId;
      const toId = w.to?.componentId || (w as any).targetComponentId;
      const toPin = w.to?.pinId || (w as any).targetPinId;
      return {
        from: { componentId: fromId === 'board' ? 'board' : fromId, pinId: fromPin },
        to: { componentId: toId === 'board' ? 'board' : toId, pinId: toPin }
      };
    }).filter(w => w.from.componentId && w.from.pinId && w.to.componentId && w.to.pinId);
    netlist.setWires(wiresList);

    // 3. Setup MCU Adapter & VM Interpreter
    mcuAdapter = new VirtualMCUAdapter(netlist, bus, boardId);
    const interpreter = new Interpreter(compiledProgram, mcuAdapter);

    if (payload.config?.breakpoints) {
      interpreter.setBreakpoints(payload.config.breakpoints);
    }

    // 4. Create Scheduler & Register Devices
    scheduler = new SimulationScheduler(interpreter, netlist, bus);

    for (const comp of payload.components) {
      // Don't register the board itself as a peripheral
      if (comp.id === boardId || comp.id === 'board') continue;

      const devicePlugin = DeviceRegistry.createDevice(comp.id, comp.definitionId);
      // Seed initial device state from the component's schema-driven properties
      // (e.g. DHT temperature/humidity, servo angle, potentiometer position).
      if (comp.properties) {
        for (const [key, value] of Object.entries(comp.properties)) {
          if (value !== undefined && value !== null) {
            (devicePlugin as any)[key] = value;
          }
        }
      }
      scheduler.registerDevice(comp.id, devicePlugin);
    }

    // 5. Wire up Events & Output
    bus.addSerialListener((text) => {
      postMessage({ type: 'serial', payload: text });
    });

    scheduler.setOnSnapshot((snapshot) => {
      // Update MCU adapter time
      if (mcuAdapter) {
        mcuAdapter.setSimTime(snapshot.simTimeMs);
      }
      postMessage({ type: 'snapshot', payload: snapshot });
    });

    // 6. Start Loop
    const speed = payload.config?.speed ?? 1.0;
    scheduler.setSpeed(speed);
    scheduler.start();

    postMessage({ type: 'state', payload: 'running' });
  } catch (error: any) {
    console.error('[SimulationWorker] Compilation/Start error:', error);
    postMessage({
      type: 'error',
      payload: { message: error.message || 'Failed to compile or start simulation' }
    });
  }
}

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'start':
      startSimulation(payload);
      break;

    case 'stop':
      if (scheduler) {
        scheduler.stop();
        scheduler = null;
      }
      postMessage({ type: 'state', payload: 'idle' });
      break;

    case 'reset':
      if (scheduler) {
        scheduler.stop();
        scheduler = null;
      }
      postMessage({ type: 'state', payload: 'idle' });
      break;

    case 'pause':
      scheduler?.pause();
      postMessage({ type: 'state', payload: 'paused' });
      break;

    case 'resume':
      scheduler?.resume();
      postMessage({ type: 'state', payload: 'running' });
      break;

    case 'interact':
      // Handle user interaction with a device property (e.g. slider change)
      if (scheduler) {
        scheduler.handleDeviceInteraction(payload.deviceId, payload.property, payload.value);
      }
      break;

    case 'setSpeed':
      if (scheduler) {
        scheduler.setSpeed(payload);
      }
      break;

    case 'setBreakpoints':
      // We can implement dynamic breakpoint updates if needed
      break;

    default:
      postMessage({
        type: 'error',
        payload: { message: `Unknown worker action: ${type}` }
      });
  }
};
