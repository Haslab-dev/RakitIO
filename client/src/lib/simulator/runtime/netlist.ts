export type PinMode =
  | 'INPUT'
  | 'OUTPUT'
  | 'INPUT_PULLUP'
  | 'INPUT_PULLDOWN'
  | 'ANALOG'
  | 'VCC'
  | 'GND'
  | 'FLOATING';

export interface PinState {
  componentId: string;
  pinId: string;
  mode: PinMode;
  value: number; // 0 or 1 for digital, or analog voltage (0.0 to 5.0)
}

export interface Connection {
  from: { componentId: string; pinId: string };
  to: { componentId: string; pinId: string };
}

export interface Net {
  id: string;
  pins: PinState[];
  state: 'HIGH' | 'LOW' | 'FLOATING' | 'CONFLICT';
  voltage: number;
}

export class NetlistSolver {
  private pins = new Map<string, PinState>(); // Key: "componentId:pinId"
  private wires: Connection[] = [];
  private dynamicConnections: Connection[] = [];

  constructor() {}

  private getPinKey(componentId: string, pinId: string): string {
    return `${componentId}:${pinId}`;
  }

  // Infer the electrical mode of a board power/ground pin from its id.
  private inferMode(componentId: string, pinId: string): PinMode {
    if (componentId === 'board') {
      const lower = pinId.toLowerCase();
      if (lower === 'gnd' || lower === 'gnd2' || lower === 'gnd3') return 'GND';
      if (['5v', '3v3', 'vin', 'vcc', 'vcc1', 'vcc2', '3v3_1', '3v3_2'].includes(lower)) return 'VCC';
    }
    return 'FLOATING';
  }

  public registerPin(componentId: string, pinId: string, mode: PinMode, initialValue = 0) {
    const key = this.getPinKey(componentId, pinId);
    this.pins.set(key, { componentId, pinId, mode, value: initialValue });
  }

  public updatePin(componentId: string, pinId: string, mode: PinMode, value: number) {
    const key = this.getPinKey(componentId, pinId);
    const pin = this.pins.get(key);
    if (pin) {
      pin.mode = mode;
      pin.value = value;
    } else {
      this.registerPin(componentId, pinId, mode, value);
    }
  }

  public getPin(componentId: string, pinId: string): PinState | undefined {
    return this.pins.get(this.getPinKey(componentId, pinId));
  }

  public setWires(wires: Connection[]) {
    this.wires = wires;
  }

  public clearDynamicConnections() {
    this.dynamicConnections = [];
  }

  public addDynamicConnection(from: { componentId: string; pinId: string }, to: { componentId: string; pinId: string }) {
    this.dynamicConnections.push({ from, to });
  }

  // Resolves the nets and propagates voltages to input/passive pins.
  // Returns the list of resolved nets and any conflicts (short circuits).
  public solve(): { nets: Net[]; conflicts: string[] } {
    const parent = new Map<string, string>();

    // Helper: Find with path compression
    function find(p: string): string {
      let root = p;
      while (parent.has(root) && parent.get(root) !== root) {
        root = parent.get(root)!;
      }
      let curr = p;
      while (parent.has(curr) && parent.get(curr) !== root) {
        const next = parent.get(curr)!;
        parent.set(curr, root);
        curr = next;
      }
      return root;
    }

    // Helper: Union by setting parent
    function union(p: string, q: string) {
      const rootP = find(p);
      const rootQ = find(q);
      if (rootP !== rootQ) {
        parent.set(rootP, rootQ);
      }
    }

    // Initialize all registered pin keys in disjoint set
    for (const key of this.pins.keys()) {
      parent.set(key, key);
    }

    // Union all wire connections
    const allConnections = [...this.wires, ...this.dynamicConnections];
    for (const conn of allConnections) {
      const keyFrom = this.getPinKey(conn.from.componentId, conn.from.pinId);
      const keyTo = this.getPinKey(conn.to.componentId, conn.to.pinId);
      
      // Ensure pins exist in the map
      if (!this.pins.has(keyFrom)) this.registerPin(conn.from.componentId, conn.from.pinId, this.inferMode(conn.from.componentId, conn.from.pinId), 0);
      if (!this.pins.has(keyTo)) this.registerPin(conn.to.componentId, conn.to.pinId, this.inferMode(conn.to.componentId, conn.to.pinId), 0);
      
      union(keyFrom, keyTo);
    }

    // Group pins by their root parent (their net)
    const netGroups = new Map<string, PinState[]>();
    for (const [key, pin] of this.pins.entries()) {
      const root = find(key);
      if (!netGroups.has(root)) {
        netGroups.set(root, []);
      }
      netGroups.get(root)!.push(pin);
    }

    const resolvedNets: Net[] = [];
    const conflicts: string[] = [];

    // Solve each net
    for (const [netId, pins] of netGroups.entries()) {
      let gndCount = 0;
      let vccCount = 0;
      let outputHighCount = 0;
      let outputLowCount = 0;
      let pullupCount = 0;
      let pulldownCount = 0;
      let analogVoltages: number[] = [];
      let firstOutputValue: number | null = null;
      let vccVoltage = 3.3;

      for (const pin of pins) {
        const pinIdLower = pin.pinId.toLowerCase();
        if (pin.mode === 'GND' || pinIdLower === 'gnd' || pinIdLower === 'gnd2' || pinIdLower === 'gnd3') {
          gndCount++;
        } else if (pin.mode === 'VCC' || ['3v3', '5v', 'vin', 'vcc'].includes(pinIdLower)) {
          vccCount++;
          if (pinIdLower === '5v' || pinIdLower === 'vin') vccVoltage = 5.0;
        } else if (pin.mode === 'OUTPUT') {
          // Treat as HIGH when the driven voltage is at/above the logic threshold.
          // This works for real voltages (5.0/3.3), PWM voltages (0-3.3), and
          // servo angle values (0-180) which are all preserved during propagation.
          if (pin.value >= 1.5) outputHighCount++;
          else outputLowCount++;
          if (firstOutputValue === null) firstOutputValue = pin.value;
        } else if (pin.mode === 'INPUT_PULLUP') {
          pullupCount++;
        } else if (pin.mode === 'INPUT_PULLDOWN') {
          pulldownCount++;
        } else if (pin.mode === 'ANALOG') {
          // If analog pin is driving (like a DAC or Potentiometer wiper), we collect it
          // In a simple digital solver, we can track analog voltages
          analogVoltages.push(pin.value);
        }
      }

      let state: Net['state'] = 'FLOATING';
      let voltage = 0;

      // Resolution Logic:
      // 1. GND wins
      // 2. VCC wins (if no GND)
      // 3. Conflicts if both HIGH and LOW outputs drive, or VCC and GND are shorted
      if (gndCount > 0 && vccCount > 0) {
        state = 'CONFLICT';
        voltage = 0;
        conflicts.push(`Short circuit: VCC and GND are connected together in Net ${netId}`);
      } else if (gndCount > 0 && outputHighCount > 0) {
        state = 'CONFLICT';
        voltage = 0;
        conflicts.push(`Short circuit: Pin set to OUTPUT HIGH is shorted to GND in Net ${netId}`);
      } else if (vccCount > 0 && outputLowCount > 0) {
        state = 'CONFLICT';
        voltage = 3.3;
        conflicts.push(`Short circuit: Pin set to OUTPUT LOW is shorted to VCC in Net ${netId}`);
      } else if (outputHighCount > 0 && outputLowCount > 0) {
        state = 'CONFLICT';
        voltage = 1.65;
        conflicts.push(`Conflict: Multiple OUTPUT pins driving different states (HIGH and LOW) in Net ${netId}`);
      } else if (gndCount > 0) {
        state = 'LOW';
        voltage = 0;
      } else if (vccCount > 0) {
        state = 'HIGH';
        voltage = vccVoltage;
      } else if (outputHighCount > 0 || outputLowCount > 0) {
        // Propagate the raw driven value so analog/PWM/servo signals survive
        // (e.g. servo angle 0-180, PWM duty voltage) instead of snapping to 0/3.3.
        state = firstOutputValue !== null && firstOutputValue >= 1.5 ? 'HIGH' : 'LOW';
        voltage = firstOutputValue !== null ? firstOutputValue : 0;
      } else if (pullupCount > 0) {
        state = 'HIGH';
        voltage = 3.3;
      } else if (pulldownCount > 0) {
        state = 'LOW';
        voltage = 0;
      } else if (analogVoltages.length > 0) {
        // Average analog voltages if multiple driven, or take the first
        voltage = analogVoltages[0];
        state = voltage >= 1.5 ? 'HIGH' : 'LOW';
      }

      // Propagate the resolved voltage back to all pins in the net
      for (const pin of pins) {
        pin.value = voltage;
      }

      resolvedNets.push({
        id: netId,
        pins,
        state,
        voltage,
      });
    }

    return { nets: resolvedNets, conflicts };
  }
}
