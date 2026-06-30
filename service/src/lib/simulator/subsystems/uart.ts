export interface UARTSubsystem {
  begin(port: number, baudRate: number): void;
  write(port: number, data: number): void;
  print(port: number, data: string): void;
  println(port: number, data: string): void;
  read(port: number): number;
  available(port: number): number;
  getOutput(port: number): string[];
  clearOutput(port: number): void;
  injectInput(port: number, data: string): void;
  reset(): void;
}

interface PortState {
  baudRate: number;
  output: string[];
  rxBuffer: number[];
  initialized: boolean;
}

export function createUART(): UARTSubsystem {
  const ports = new Map<number, PortState>();

  function ensurePort(port: number): PortState {
    if (!ports.has(port)) {
      ports.set(port, {
        baudRate: 9600,
        output: [],
        rxBuffer: [],
        initialized: false,
      });
    }
    return ports.get(port)!;
  }

  return {
    begin(port: number, baudRate: number): void {
      const state = ensurePort(port);
      state.baudRate = baudRate;
      state.initialized = true;
      state.output = [];
      state.rxBuffer = [];
    },

    write(port: number, data: number): void {
      const state = ensurePort(port);
      if (!state.initialized) return;
      const char = String.fromCharCode(data & 0xff);
      if (state.output.length > 0) {
        state.output[state.output.length - 1] += char;
      } else {
        state.output.push(char);
      }
    },

    print(port: number, data: string): void {
      const state = ensurePort(port);
      if (!state.initialized) return;
      if (state.output.length > 0) {
        state.output[state.output.length - 1] += data;
      } else {
        state.output.push(data);
      }
    },

    println(port: number, data: string): void {
      const state = ensurePort(port);
      if (!state.initialized) return;
      state.output.push(data);
    },

    read(port: number): number {
      const state = ensurePort(port);
      if (!state.initialized || state.rxBuffer.length === 0) {
        return -1;
      }
      return state.rxBuffer.shift()!;
    },

    available(port: number): number {
      const state = ensurePort(port);
      if (!state.initialized) return 0;
      return state.rxBuffer.length;
    },

    getOutput(port: number): string[] {
      const state = ensurePort(port);
      return [...state.output];
    },

    clearOutput(port: number): void {
      const state = ensurePort(port);
      state.output = [];
    },

    injectInput(port: number, data: string): void {
      const state = ensurePort(port);
      if (!state.initialized) return;
      for (let i = 0; i < data.length; i++) {
        state.rxBuffer.push(data.charCodeAt(i));
      }
    },

    reset(): void {
      ports.clear();
    },
  };
}
