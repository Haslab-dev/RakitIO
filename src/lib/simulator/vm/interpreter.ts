import type { CompiledProgram, Instruction, Register } from './bytecode';

export interface VMFrame {
  fnName: string;
  instructions: Instruction[];
  ip: number;
  registers: Map<Register, any>;
  locals: Map<string, any>;
  returnReg?: Register;
}

export interface MCUAdapter {
  pinMode(pin: number, mode: string): void;
  digitalWrite(pin: number, value: number): void;
  digitalRead(pin: number): number;
  analogWrite(pin: number, value: number): void;
  analogRead(pin: number): number;
  millis(): number;
  micros(): number;
  serialWrite(text: string): void;
  
  // I2C
  wireBegin(): void;
  wireBeginTransmission(address: number): void;
  wireWrite(value: number): void;
  wireEndTransmission(): number; // Returns ACK (0) or NACK (1-4)
  wireRequestFrom(address: number, quantity: number): number;
  wireRead(): number;

  // DHT
  dhtReadTemperature(): number;
  dhtReadHumidity(): number;
}

export class Interpreter {
  private program: CompiledProgram;
  private mcu: MCUAdapter;
  private callStack: VMFrame[] = [];
  private globals = new Map<string, any>();
  private state: 'idle' | 'running' | 'paused' | 'waiting' | 'halted' = 'idle';
  private waitResumeTime = 0;
  private breakpoints = new Set<number>();
  private servoPins = new Map<string, number>();

  constructor(program: CompiledProgram, mcu: MCUAdapter) {
    this.program = program;
    this.mcu = mcu;
  }

  public setBreakpoints(lines: number[]) {
    this.breakpoints = new Set(lines);
  }

  public getVariables(): Record<string, any> {
    const vars: Record<string, any> = { globals: {} };
    for (const [k, v] of this.globals) {
      vars.globals[k] = v;
    }

    const currentFrame = this.currentFrame();
    if (currentFrame) {
      vars.locals = {};
      for (const [k, v] of currentFrame.locals) {
        vars.locals[k] = v;
      }
      vars.registers = {};
      for (const [k, v] of currentFrame.registers) {
        vars.registers[k] = v;
      }
      vars.fnName = currentFrame.fnName;
      vars.ip = currentFrame.ip;
    }
    return vars;
  }

  public getCallStack(): string[] {
    return this.callStack.map(f => `${f.fnName} (ip: ${f.ip})`);
  }

  private currentFrame(): VMFrame | null {
    return this.callStack[this.callStack.length - 1] || null;
  }

  public start() {
    this.callStack = [];
    this.globals.clear();
    this.state = 'running';

    // Seed Arduino standard constants (macros like HIGH/LOW/OUTPUT are normally
    // provided by #define, which the parser strips out).
    const constants: Record<string, number> = {
      HIGH: 1,
      LOW: 0,
      INPUT: 0,
      OUTPUT: 1,
      INPUT_PULLUP: 2,
      INPUT_PULLDOWN: 3,
      LED_BUILTIN: 13,
      A0: 14, A1: 15, A2: 16, A3: 17, A4: 18, A5: 19,
    };
    for (const [k, v] of Object.entries(constants)) {
      this.globals.set(k, v);
    }

    // 1. Execute Globals
    if (this.program.globals.length > 0) {
      this.callStack.push({
        fnName: 'global_init',
        instructions: this.program.globals,
        ip: 0,
        registers: new Map(),
        locals: new Map(),
      });
    } else {
      this.pushSetup();
    }
  }

  // Called after a top-level phase frame (global_init / setup / loop) is popped.
  // Advances the VM to the next Arduino lifecycle phase.
  private advancePhase(frame: VMFrame) {
    if (this.callStack.length > 0) return;
    if (frame.fnName === 'global_init') {
      this.pushSetup();
    } else if (frame.fnName === 'setup') {
      this.pushLoop();
    } else if (frame.fnName === 'loop') {
      // Re-schedule loop() forever
      this.pushLoop();
    } else {
      this.state = 'halted';
    }
  }

  private pushSetup() {
    if (this.program.functions['setup']) {
      this.callStack.push({
        fnName: 'setup',
        instructions: this.program.functions['setup'].instructions,
        ip: 0,
        registers: new Map(),
        locals: new Map(),
      });
    } else {
      this.pushLoop();
    }
  }

  private pushLoop() {
    if (this.program.functions['loop']) {
      this.callStack.push({
        fnName: 'loop',
        instructions: this.program.functions['loop'].instructions,
        ip: 0,
        registers: new Map(),
        locals: new Map(),
      });
    } else {
      this.state = 'halted';
    }
  }

  public step(currentTimeMs: number): { hitBreakpoint: boolean; currentLine?: number } {
    if (this.state === 'waiting') {
      if (currentTimeMs >= this.waitResumeTime) {
        this.state = 'running';
      } else {
        return { hitBreakpoint: false };
      }
    }

    if (this.state !== 'running') {
      return { hitBreakpoint: false };
    }

    const frame = this.currentFrame();
    if (!frame) {
      this.state = 'halted';
      return { hitBreakpoint: false };
    }

    // Resolve labels: if the current instruction is a label marker, skip it
    while (frame.ip < frame.instructions.length && frame.instructions[frame.ip].op === 'JMP' && frame.instructions[frame.ip].args[1] === 'LABEL') {
      frame.ip++;
    }

    if (frame.ip >= frame.instructions.length) {
      // Pop frame
      this.callStack.pop();
      this.advancePhase(frame);
      return { hitBreakpoint: false };
    }

    const inst = frame.instructions[frame.ip];
    const currentLine = inst.line;

    // Check breakpoint BEFORE executing the instruction
    if (this.breakpoints.has(currentLine)) {
      // To prevent looping on the same breakpoint, we check if we've already halted here.
      // For simplicity, we just trigger it and return.
      return { hitBreakpoint: true, currentLine };
    }

    this.executeInstruction(inst, frame, currentTimeMs);
    frame.ip++;

    return { hitBreakpoint: false, currentLine };
  }

  private executeInstruction(inst: Instruction, frame: VMFrame, currentTimeMs: number) {
    const { op, args } = inst;

    switch (op) {
      case 'MOV': {
        const [dest, val] = args;
        const value = this.resolveValue(val, frame);
        frame.registers.set(dest, value);
        break;
      }

      case 'LOAD': {
        const [dest, name] = args;
        // Check if member access (e.g., R0.property)
        if (name.includes('.')) {
          const [objReg, prop] = name.split('.');
          const obj = frame.registers.get(objReg);
          frame.registers.set(dest, obj ? obj[prop] : undefined);
        } else {
          const val = frame.locals.has(name) ? frame.locals.get(name) : this.globals.get(name);
          frame.registers.set(dest, val);
        }
        break;
      }

      case 'STORE': {
        const [name, src] = args;
        const val = this.resolveValue(src, frame);
        if (name.includes('.')) {
          const [objReg, prop] = name.split('.');
          const obj = frame.registers.get(objReg);
          if (obj) obj[prop] = val;
        } else {
          if (frame.locals.has(name) || frame.fnName !== 'global_init') {
            frame.locals.set(name, val);
          } else {
            this.globals.set(name, val);
          }
        }
        break;
      }

      case 'OP': {
        const [dest, operator, left, right] = args;
        const lVal = this.resolveValue(left, frame);
        const rVal = right !== undefined ? this.resolveValue(right, frame) : undefined;

        let result: any;
        if (rVal !== undefined) {
          switch (operator) {
            case '+': result = lVal + rVal; break;
            case '-': result = lVal - rVal; break;
            case '*': result = lVal * rVal; break;
            case '/': result = lVal / rVal; break;
            case '%': result = lVal % rVal; break;
            case '==': result = lVal == rVal; break;
            case '!=': result = lVal != rVal; break;
            case '<': result = lVal < rVal; break;
            case '>': result = lVal > rVal; break;
            case '<=': result = lVal <= rVal; break;
            case '>=': result = lVal >= rVal; break;
            case '&&': result = lVal && rVal; break;
            case '||': result = lVal || rVal; break;
            default: result = 0;
          }
        } else {
          switch (operator) {
            case '!': result = !lVal; break;
            case '-': result = -lVal; break;
            case '++': result = lVal + 1; break;
            case '--': result = lVal - 1; break;
            default: result = 0;
          }
        }
        frame.registers.set(dest, result);
        break;
      }

      case 'JMP': {
        const [label] = args;
        const targetIp = this.findLabelIp(label, frame);
        if (targetIp !== -1) {
          frame.ip = targetIp - 1; // Subtract 1 because loop increments ip
        }
        break;
      }

      case 'JMP_IF': {
        const [label, condReg, expectedBool] = args;
        const cond = Boolean(this.resolveValue(condReg, frame));
        if (cond === expectedBool) {
          const targetIp = this.findLabelIp(label, frame);
          if (targetIp !== -1) {
            frame.ip = targetIp - 1;
          }
        }
        break;
      }

      case 'CALL': {
        const [dest, fnName, argRegs] = args;
        const argValues = argRegs.map((r: Register) => this.resolveValue(r, frame));

        if (this.isBuiltIn(fnName)) {
          const result = this.executeBuiltIn(fnName, argValues, currentTimeMs);
          frame.registers.set(dest, result);
        } else if (this.program.functions[fnName]) {
          // Push new frame
          const fnDef = this.program.functions[fnName];
          const nextFrame: VMFrame = {
            fnName,
            instructions: fnDef.instructions,
            ip: -1, // Will become 0 on next tick
            registers: new Map(),
            locals: new Map(),
            returnReg: dest,
          };
          // Bind arguments to parameters
          fnDef.params.forEach((param, idx) => {
            nextFrame.locals.set(param, argValues[idx]);
          });
          this.callStack.push(nextFrame);
        } else {
          console.warn(`[VM] Function not found: ${fnName}`);
          frame.registers.set(dest, undefined);
        }
        break;
      }

      case 'WAIT': {
        const [timeReg] = args;
        const duration = this.resolveValue(timeReg, frame);
        this.state = 'waiting';
        this.waitResumeTime = currentTimeMs + duration;
        break;
      }

      case 'RET': {
        const [srcReg] = args;
        const val = this.resolveValue(srcReg, frame);
        this.callStack.pop();
        const prevFrame = this.currentFrame();
        if (prevFrame && frame.returnReg) {
          prevFrame.registers.set(frame.returnReg, val);
        } else if (!prevFrame) {
          // Top-level phase (setup/loop/global_init) just returned -> advance lifecycle
          this.advancePhase(frame);
        }
        break;
      }
    }
  }

  private resolveValue(val: any, frame: VMFrame): any {
    if (typeof val === 'string' && val.startsWith('R') && !isNaN(parseInt(val.slice(1), 10))) {
      return frame.registers.get(val);
    }
    return val;
  }

  private findLabelIp(label: string, frame: VMFrame): number {
    for (let i = 0; i < frame.instructions.length; i++) {
      const inst = frame.instructions[i];
      if (inst.op === 'JMP' && inst.args[0] === label && inst.args[1] === 'LABEL') {
        return i;
      }
    }
    return -1;
  }

  private isBuiltIn(name: string): boolean {
    if (name.includes('.') && (name.endsWith('.attach') || name.endsWith('.write'))) {
      return true;
    }
    const builtins = [
      'pinMode', 'digitalWrite', 'digitalRead', 'analogWrite', 'analogRead',
      'millis', 'micros', 'delay', 'delayMicroseconds',
      'map', 'constrain', 'min', 'max', 'abs', 'random',
      'Serial.begin', 'Serial.print', 'Serial.println', 'Serial.write',
      'Wire.begin', 'Wire.beginTransmission', 'Wire.write', 'Wire.endTransmission', 'Wire.requestFrom', 'Wire.read',
      'dht.begin', 'dht.readHumidity', 'dht.readTemperature', 'isnan'
    ];
    return builtins.includes(name);
  }

  private executeBuiltIn(name: string, args: any[], currentTimeMs: number): any {
    if (name.includes('.')) {
      const parts = name.split('.');
      const method = parts[parts.length - 1];
      const objName = parts[0];

      // Servo-style attach()/write() only apply to user objects (e.g. myServo).
      // Reserved bus/serial objects (Wire, Serial, dht, ...) are handled by the
      // switch below so that Wire.write / Serial.write are NOT swallowed here.
      const reserved = ['Serial', 'Wire', 'dht', 'SPI', 'EEPROM'];
      if (!reserved.includes(objName)) {
        if (method === 'attach') {
          this.servoPins.set(objName, args[0]);
          return;
        }
        if (method === 'write') {
          const pin = this.servoPins.get(objName);
          if (pin !== undefined) {
            (this.mcu as any).servoWrite?.(pin, args[0]);
          }
          return;
        }
      }
    }

    switch (name) {
      case 'pinMode':
        this.mcu.pinMode(args[0], args[1]);
        break;
      case 'digitalWrite':
        this.mcu.digitalWrite(args[0], args[1]);
        break;
      case 'digitalRead':
        return this.mcu.digitalRead(args[0]);
      case 'analogWrite':
        this.mcu.analogWrite(args[0], args[1]);
        break;
      case 'analogRead':
        return this.mcu.analogRead(args[0]);
      case 'delay':
        this.state = 'waiting';
        this.waitResumeTime = currentTimeMs + args[0];
        break;
      case 'delayMicroseconds':
        this.state = 'waiting';
        this.waitResumeTime = currentTimeMs + (args[0] / 1000);
        break;
      case 'millis':
        return this.mcu.millis();
      case 'micros':
        return this.mcu.micros();
      case 'map': {
        const [x, inMin, inMax, outMin, outMax] = args;
        return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
      }
      case 'constrain': {
        const [x, a, b] = args;
        return Math.min(Math.max(x, a), b);
      }
      case 'min':
        return Math.min(args[0], args[1]);
      case 'max':
        return Math.max(args[0], args[1]);
      case 'abs':
        return Math.abs(args[0]);
      case 'random':
        return args.length >= 2 ? Math.floor(Math.random() * (args[1] - args[0]) + args[0]) : Math.floor(Math.random() * args[0]);
      case 'Serial.begin':
        break;
      case 'Serial.print':
        this.mcu.serialWrite(String(args[0]));
        break;
      case 'Serial.println':
        this.mcu.serialWrite(String(args[0] ?? '') + '\n');
        break;
      case 'Serial.write':
        this.mcu.serialWrite(String.fromCharCode(args[0]));
        break;
      case 'dht.begin':
        break;
      case 'dht.readHumidity':
        return this.mcu.dhtReadHumidity();
      case 'dht.readTemperature':
        return this.mcu.dhtReadTemperature();
      case 'isnan':
        return false;
      case 'Wire.begin':
        this.mcu.wireBegin();
        break;
      case 'Wire.beginTransmission':
        this.mcu.wireBeginTransmission(args[0]);
        break;
      case 'Wire.write':
        this.mcu.wireWrite(args[0]);
        break;
      case 'Wire.endTransmission':
        return this.mcu.wireEndTransmission();
      case 'Wire.requestFrom':
        return this.mcu.wireRequestFrom(args[0], args[1]);
      case 'Wire.read':
        return this.mcu.wireRead();
    }
    return undefined;
  }
}
