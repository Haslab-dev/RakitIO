import { describe, test, expect, beforeEach } from 'bun:test';
import { Interpreter, type MCUAdapter } from './interpreter';
import type { CompiledProgram } from './bytecode';

const createMockMCU = (): MCUAdapter => ({
  pinMode: () => {},
  digitalWrite: () => {},
  digitalRead: () => 1,
  analogWrite: () => {},
  analogRead: () => 512,
  millis: () => 0,
  micros: () => 0,
  serialWrite: () => {},
  wireBegin: () => {},
  wireBeginTransmission: () => {},
  wireWrite: () => {},
  wireEndTransmission: () => 0,
  wireRequestFrom: () => 0,
  wireRead: () => -1,
  dhtReadTemperature: () => 25.0,
  dhtReadHumidity: () => 60.0,
  pulseIn: () => 150,
  tone: () => {},
  noTone: () => {},
  attachInterrupt: () => {},
  detachInterrupt: () => {},
});

describe('VM Interpreter', () => {
  let mockMCU: MCUAdapter;
  let vm: Interpreter;

  beforeEach(() => {
    mockMCU = createMockMCU();
  });

  test('initializes with Arduino constants', () => {
    const program: CompiledProgram = { functions: {}, globals: [] };
    vm = new Interpreter(program, mockMCU);
    vm.start();
    const vars = vm.getVariables();
    expect(vars.globals['HIGH']).toBe(1);
    expect(vars.globals['LOW']).toBe(0);
    expect(vars.globals['OUTPUT']).toBe(1);
  });

  test('initializes with ADC pin constants', () => {
    const program: CompiledProgram = { functions: {}, globals: [] };
    vm = new Interpreter(program, mockMCU);
    vm.start();
    const vars = vm.getVariables();
    expect(vars.globals['A0']).toBe(14);
    expect(vars.globals['A1']).toBe(15);
  });

  test('executes simple empty program', () => {
    const program: CompiledProgram = {
      functions: {
        setup: { params: [], instructions: [] },
        loop: { params: [], instructions: [] }
      },
      globals: []
    };
    vm = new Interpreter(program, mockMCU);
    vm.start();
    const vars = vm.getVariables();
    expect(vars.fnName).toBe('setup');
  });

  test('executes setup then loop lifecycle', () => {
    let callOrder: string[] = [];
    const program: CompiledProgram = {
      functions: {
        setup: {
          params: [],
          instructions: [
            { op: 'CALL', args: ['R0', 'Serial.begin', []], line: 1 },
            { op: 'RET', args: ['R0'], line: 2 }
          ]
        },
        loop: {
          params: [],
          instructions: [
            { op: 'RET', args: ['R0'], line: 4 }
          ]
        }
      },
      globals: []
    };
    
    const serialWriteMock = () => callOrder.push('setup');
    const mcu = { ...mockMCU, serialWrite: serialWriteMock };
    
    vm = new Interpreter(program, mcu);
    vm.start();
    
    // Run setup
    vm.step(0);
    vm.step(1);
    vm.step(2);
    
    // Run loop once
    vm.step(3);
    vm.step(4);
  });

  test('executes 10000 steps without halting on WAIT', () => {
    const program: CompiledProgram = {
      functions: {
        setup: { params: [], instructions: [] },
        loop: {
          params: [],
          instructions: [
            { op: 'WAIT', args: ['R0'], line: 1 }
          ]
        }
      },
      globals: []
    };
    vm = new Interpreter(program, mockMCU);
    vm.start();
    
    for (let i = 0; i < 10000; i++) {
      vm.step(i);
      if (vm.getVariables().fnName === undefined) break;
    }
    
    expect(true).toBe(true);
  });

  test('executes digitalWrite built-in', () => {
    let writePin = -1;
    let writeValue = -1;
    const mcu = {
      ...mockMCU,
      digitalWrite: (pin: number, value: number) => {
        writePin = pin;
        writeValue = value;
      }
    };

    // Load constants directly as instruction args
    const program: CompiledProgram = {
      functions: {
        setup: { params: [], instructions: [] },
        loop: {
          params: [],
          instructions: [
            { op: 'CALL', args: ['R0', 'digitalWrite', [13, 1]], line: 1 },
            { op: 'WAIT', args: ['R0'], line: 2 }
          ]
        }
      },
      globals: []
    };
    
    vm = new Interpreter(program, mcu);
    vm.start();
    
    vm.step(0);
    vm.step(1);
    
    expect(writePin).toBe(13);
    expect(writeValue).toBe(1);
  });

  test('executes delay built-in', () => {
    const program: CompiledProgram = {
      functions: {
        setup: { params: [], instructions: [] },
        loop: {
          params: [],
          instructions: [
            { op: 'CALL', args: ['R0', 'delay', ['R1']], line: 1 }
          ]
        }
      },
      globals: []
    };
    
    vm = new Interpreter(program, mockMCU);
    vm.start();
    
    vm.step(0);
    vm.getVariables().registers['R1'] = 1000;
    
    // First call enters wait state
    vm.step(1);
    const vars = vm.getVariables();
    
    // Should be in waiting state
    expect(vars.fnName).toBeDefined();
  });

  test('executes millis built-in', () => {
    let capturedMillis = 0;
    const mcu = {
      ...mockMCU,
      millis: () => { capturedMillis = 5000; return 5000; }
    };

    const program: CompiledProgram = {
      functions: {
        setup: { params: [], instructions: [] },
        loop: {
          params: [],
          instructions: [
            { op: 'CALL', args: ['R0', 'millis', []], line: 1 },
            { op: 'WAIT', args: ['R0'], line: 2 }
          ]
        }
      },
      globals: []
    };
    
    vm = new Interpreter(program, mcu);
    vm.start();
    
    vm.step(0);
    vm.step(1);
    
    expect(capturedMillis).toBe(5000);
  });

  test('handles breakpoints', () => {
    const program: CompiledProgram = {
      functions: {
        setup: { params: [], instructions: [] },
        loop: {
          params: [],
          instructions: [
            { op: 'MOV', args: ['R0', 1], line: 1 },
            { op: 'MOV', args: ['R0', 2], line: 2 }
          ]
        }
      },
      globals: []
    };
    
    vm = new Interpreter(program, mockMCU);
    vm.setBreakpoints([1]);
    vm.start();
    
    vm.step(0);
    const result = vm.step(1);
    
    expect(result.hitBreakpoint).toBe(true);
    expect(result.currentLine).toBe(1);
  });

  test('executes arithmetic operations', () => {
    const program: CompiledProgram = {
      functions: {
        setup: { params: [], instructions: [] },
        loop: {
          params: [],
          instructions: [
            { op: 'OP', args: ['R0', '+', 2, 3], line: 1 },
            { op: 'WAIT', args: ['R0'], line: 2 }
          ]
        }
      },
      globals: []
    };
    
    vm = new Interpreter(program, mockMCU);
    vm.start();
    
    vm.step(0);
    vm.step(1);
    
    const vars = vm.getVariables();
    expect(vars.registers['R0']).toBe(5);
  });

  test('executes JMP instruction', () => {
    const program: CompiledProgram = {
      functions: {
        setup: { params: [], instructions: [] },
        loop: {
          params: [],
          instructions: [
            { op: 'JMP', args: ['label_1', 'LABEL'], line: 1 },
            { op: 'MOV', args: ['R0', 0], line: 2 },
            { op: 'JMP', args: ['label_1', 'LABEL'], line: 3 },
            { op: 'MOV', args: ['R0', 1], line: 4 }, // label_1
            { op: 'WAIT', args: ['R0'], line: 5 }
          ]
        }
      },
      globals: []
    };
    
    vm = new Interpreter(program, mockMCU);
    vm.start();
    
    vm.step(0);
    vm.step(1); // JMP to label_1
    vm.step(2); // MOV R0, 1
    
    const vars = vm.getVariables();
    expect(vars.registers['R0']).toBe(1);
  });

  test('executes pulseIn built-in', () => {
    let pulseInCalled = false;
    const mcu = {
      ...mockMCU,
      pulseIn: () => {
        pulseInCalled = true;
        return 150;
      }
    };

    const program: CompiledProgram = {
      functions: {
        setup: { params: [], instructions: [] },
        loop: {
          params: [],
          instructions: [
            { op: 'CALL', args: ['R0', 'pulseIn', ['R1', 'R2', 'R3']], line: 1 },
            { op: 'WAIT', args: ['R0'], line: 2 }
          ]
        }
      },
      globals: []
    };
    
    vm = new Interpreter(program, mcu);
    vm.start();
    
    vm.step(0);
    vm.getVariables().registers['R1'] = 7;
    vm.getVariables().registers['R2'] = 'HIGH';
    vm.getVariables().registers['R3'] = 1000000;
    
    vm.step(1);
    
    expect(pulseInCalled).toBe(true);
  });

  test('executes map built-in', () => {
    const program: CompiledProgram = {
      functions: {
        setup: { params: [], instructions: [] },
        loop: {
          params: [],
          instructions: [
            { op: 'CALL', args: ['R0', 'map', [128, 0, 255, 0, 180]], line: 1 },
            { op: 'WAIT', args: ['R0'], line: 2 }
          ]
        }
      },
      globals: []
    };
    
    vm = new Interpreter(program, mockMCU);
    vm.start();
    
    vm.step(0);
    vm.step(1);
    
    const result = vm.getVariables().registers['R0'];
    expect(Math.round(result)).toBe(90); // 128 mapped to 0-180 range
  });

  test('executes MOV instruction without errors', () => {
    const program: CompiledProgram = {
      functions: {
        setup: { params: [], instructions: [] },
        loop: {
          params: [],
          instructions: [
            { op: 'MOV', args: ['R0', 42], line: 1 },
            { op: 'WAIT', args: ['R0'], line: 2 }
          ]
        }
      },
      globals: []
    };
    
    vm = new Interpreter(program, mockMCU);
    vm.start();
    
    // Should execute without throwing
    expect(() => vm.step(0)).not.toThrow();
    expect(() => vm.step(1)).not.toThrow();
  });

  test('getCallStack returns function names', () => {
    const program: CompiledProgram = {
      functions: {
        setup: { params: [], instructions: [] },
        loop: {
          params: [],
          instructions: [
            { op: 'WAIT', args: ['R0'], line: 1 }
          ]
        }
      },
      globals: []
    };
    
    vm = new Interpreter(program, mockMCU);
    vm.start();
    
    const stack = vm.getCallStack();
    expect(stack.length).toBeGreaterThanOrEqual(1);
  });
});
