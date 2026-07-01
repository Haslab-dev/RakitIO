import { describe, test, expect, beforeEach } from 'bun:test';
import { NetlistSolver } from './netlist';

describe('NetlistSolver', () => {
  let solver: NetlistSolver;

  beforeEach(() => {
    solver = new NetlistSolver();
  });

  test('resolves HIGH state from VCC pin', () => {
    solver.registerPin('board', '5V', 'VCC', 5.0);
    const { nets } = solver.solve();
    expect(nets[0].state).toBe('HIGH');
    expect(nets[0].voltage).toBe(5.0);
  });

  test('resolves LOW state from GND pin', () => {
    solver.registerPin('board', 'GND', 'GND', 0);
    const { nets } = solver.solve();
    expect(nets[0].state).toBe('LOW');
    expect(nets[0].voltage).toBe(0);
  });

  test('resolves FLOATING state when no pins connected', () => {
    solver.registerPin('led', 'anode', 'INPUT', 0);
    const { nets } = solver.solve();
    expect(nets[0].state).toBe('FLOATING');
  });

  test('detects CONFLICT when VCC and GND are shorted', () => {
    solver.registerPin('board', '5V', 'VCC', 5.0);
    solver.registerPin('board', 'GND', 'GND', 0);
    solver.setWires([{
      from: { componentId: 'board', pinId: '5V' },
      to: { componentId: 'board', pinId: 'GND' }
    }]);
    const { conflicts } = solver.solve();
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0]).toContain('Short circuit');
  });

  test('detects CONFLICT when OUTPUT HIGH is connected to GND', () => {
    solver.registerPin('board', 'D13', 'OUTPUT', 5.0);
    solver.registerPin('board', 'GND', 'GND', 0);
    solver.setWires([{
      from: { componentId: 'board', pinId: 'D13' },
      to: { componentId: 'board', pinId: 'GND' }
    }]);
    const { conflicts } = solver.solve();
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0]).toContain('OUTPUT HIGH');
  });

  test('detects CONFLICT when two outputs drive different values', () => {
    solver.registerPin('board', 'D1', 'OUTPUT', 5.0);
    solver.registerPin('board', 'D2', 'OUTPUT', 0);
    solver.setWires([{
      from: { componentId: 'board', pinId: 'D1' },
      to: { componentId: 'board', pinId: 'D2' }
    }]);
    const { conflicts } = solver.solve();
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0]).toContain('Conflict');
  });

  test('propagates voltage through wire connections', () => {
    solver.registerPin('board', 'D13', 'OUTPUT', 5.0);
    solver.registerPin('led', 'anode', 'INPUT', 0);
    solver.setWires([{
      from: { componentId: 'board', pinId: 'D13' },
      to: { componentId: 'led', pinId: 'anode' }
    }]);
    const { nets } = solver.solve();
    const ledNet = nets.find(n => n.pins.some(p => p.componentId === 'led'));
    expect(ledNet?.voltage).toBe(5.0);
    expect(ledNet?.state).toBe('HIGH');
  });

  test('INPUT_PULLUP resolves to HIGH', () => {
    solver.registerPin('board', 'D2', 'INPUT_PULLUP', 0);
    const { nets } = solver.solve();
    expect(nets[0].state).toBe('HIGH');
    expect(nets[0].voltage).toBe(3.3);
  });

  test('INPUT_PULLDOWN resolves to LOW', () => {
    solver.registerPin('board', 'D2', 'INPUT_PULLDOWN', 0);
    const { nets } = solver.solve();
    expect(nets[0].state).toBe('LOW');
    expect(nets[0].voltage).toBe(0);
  });

  test('multiple pins on same net share voltage', () => {
    solver.registerPin('board', '5V', 'VCC', 5.0);
    solver.registerPin('led', 'anode', 'INPUT', 0);
    solver.registerPin('resistor', 'leg1', 'INPUT', 0);
    solver.setWires([
      { from: { componentId: 'board', pinId: '5V' }, to: { componentId: 'led', pinId: 'anode' } },
      { from: { componentId: 'led', pinId: 'anode' }, to: { componentId: 'resistor', pinId: 'leg1' } }
    ]);
    const { nets } = solver.solve();
    expect(nets.length).toBe(1);
    expect(nets[0].pins.length).toBe(3);
    expect(nets[0].voltage).toBe(5.0);
  });

  test('updatePin modifies existing pin', () => {
    solver.registerPin('board', 'D13', 'OUTPUT', 0);
    solver.updatePin('board', 'D13', 'OUTPUT', 5.0);
    const pin = solver.getPin('board', 'D13');
    expect(pin?.value).toBe(5.0);
  });

  test('getPin returns undefined for non-existent pin', () => {
    const pin = solver.getPin('nonexistent', 'pin');
    expect(pin).toBeUndefined();
  });

  test('dynamic connections are resolved', () => {
    solver.registerPin('board', 'D2', 'OUTPUT', 5.0);
    solver.registerPin('button', 'pin1', 'INPUT', 0);
    solver.addDynamicConnection(
      { componentId: 'board', pinId: 'D2' },
      { componentId: 'button', pinId: 'pin1' }
    );
    const { nets } = solver.solve();
    const buttonNet = nets.find(n => n.pins.some(p => p.componentId === 'button'));
    expect(buttonNet?.voltage).toBe(5.0);
  });

  test('clearing dynamic connections removes them', () => {
    solver.registerPin('board', 'D2', 'OUTPUT', 5.0);
    solver.registerPin('button', 'pin1', 'INPUT', 0);
    solver.addDynamicConnection(
      { componentId: 'board', pinId: 'D2' },
      { componentId: 'button', pinId: 'pin1' }
    );
    solver.clearDynamicConnections();
    const { nets } = solver.solve();
    expect(nets.length).toBe(2);
  });
});
