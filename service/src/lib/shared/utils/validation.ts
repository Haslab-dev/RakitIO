import type { WireConnection } from '../types/wire';
import type { BoardDefinition } from '../types/board';
import type { ComponentInstance } from '../types/component';
import type { Project } from '../types/project';
import { COMPONENTS_BY_ID } from '../constants/components';
import { BOARDS_BY_ID } from '../constants/boards';

export interface ValidationError {
  type: 'error' | 'warning';
  code: string;
  message: string;
  sourceId?: string;
  sourceType?: 'wire' | 'component' | 'board' | 'pin';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ErrorReport {
  sourceType: 'wire' | 'component' | 'board' | 'pin';
  sourceId: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

function makeResult(errors: ValidationError[]): ValidationResult {
  return {
    valid: errors.filter((e) => e.type === 'error').length === 0,
    errors: errors.filter((e) => e.type === 'error'),
    warnings: errors.filter((e) => e.type === 'warning'),
  };
}

function findPinOnBoard(board: BoardDefinition, pinId: string) {
  return board.pins.find((p) => p.id === pinId);
}

function findComponentPin(component: ComponentInstance, pinId: string) {
  const def = COMPONENTS_BY_ID[component.definitionId];
  if (!def) return undefined;
  return def.pins.find((p) => p.id === pinId);
}

export function validateWireConnection(
  wire: WireConnection,
  board: BoardDefinition,
  components: ComponentInstance[]
): ValidationResult {
  const errors: ValidationError[] = [];

  const sourceComponent = components.find((c) => c.id === wire.sourceComponentId);
  const targetComponent = components.find((c) => c.id === wire.targetComponentId);

  if (!sourceComponent) {
    errors.push({
      type: 'error',
      code: 'WIRE_MISSING_SOURCE',
      message: `Source component "${wire.sourceComponentId}" not found`,
      sourceId: wire.id,
      sourceType: 'wire',
    });
  }

  if (!targetComponent) {
    errors.push({
      type: 'error',
      code: 'WIRE_MISSING_TARGET',
      message: `Target component "${wire.targetComponentId}" not found`,
      sourceId: wire.id,
      sourceType: 'wire',
    });
  }

  if (sourceComponent) {
    const sourcePin = findComponentPin(sourceComponent, wire.sourcePinId);
    if (!sourcePin) {
      errors.push({
        type: 'error',
        code: 'WIRE_INVALID_SOURCE_PIN',
        message: `Source pin "${wire.sourcePinId}" not found on component "${sourceComponent.definitionId}"`,
        sourceId: wire.id,
        sourceType: 'wire',
      });
    }
  }

  if (targetComponent) {
    const targetPin = findComponentPin(targetComponent, wire.targetPinId);
    if (!targetPin) {
      errors.push({
        type: 'error',
        code: 'WIRE_INVALID_TARGET_PIN',
        message: `Target pin "${wire.targetPinId}" not found on component "${targetComponent.definitionId}"`,
        sourceId: wire.id,
        sourceType: 'wire',
      });
    }
  }

  if (wire.segments.length === 0) {
    errors.push({
      type: 'warning',
      code: 'WIRE_NO_SEGMENTS',
      message: 'Wire has no visual segments',
      sourceId: wire.id,
      sourceType: 'wire',
    });
  }

  return makeResult(errors);
}

export function validateNet(wires: WireConnection[]): ValidationResult {
  const errors: ValidationError[] = [];

  const sourceKeys = wires.map((w) => `${w.sourceComponentId}:${w.sourcePinId}`);
  const targetKeys = wires.map((w) => `${w.targetComponentId}:${w.targetPinId}`);

  const sourceCount = new Map<string, number>();
  for (const key of sourceKeys) {
    sourceCount.set(key, (sourceCount.get(key) ?? 0) + 1);
  }

  for (const [key, count] of sourceCount) {
    if (count > 1) {
      errors.push({
        type: 'warning',
        code: 'NET_MULTI_SOURCE',
        message: `Pin "${key}" is used as source in ${count} wires in the same net`,
        sourceType: 'wire',
      });
    }
  }

  const connectedPins = new Set([...sourceKeys, ...targetKeys]);
  if (wires.length > 0 && connectedPins.size < 2) {
    errors.push({
      type: 'error',
      code: 'NET_SINGLE_ENDPOINT',
      message: 'Net connects to fewer than 2 unique endpoints',
      sourceType: 'wire',
    });
  }

  return makeResult(errors);
}

export function detectErrors(project: Project): ErrorReport[] {
  const reports: ErrorReport[] = [];

  const board = BOARDS_BY_ID[project.boardId];
  if (!board) {
    reports.push({
      sourceType: 'board',
      sourceId: project.boardId,
      code: 'PROJECT_INVALID_BOARD',
      message: `Board "${project.boardId}" not found`,
      severity: 'error',
    });
  }

  const componentIds = new Set(project.components.map((c) => c.id));

  for (const component of project.components) {
    const def = COMPONENTS_BY_ID[component.definitionId];
    if (!def) {
      reports.push({
        sourceType: 'component',
        sourceId: component.id,
        code: 'COMPONENT_INVALID_DEFINITION',
        message: `Component definition "${component.definitionId}" not found`,
        severity: 'error',
      });
    }
  }

  for (const wire of project.wires) {
    if (!componentIds.has(wire.sourceComponentId)) {
      reports.push({
        sourceType: 'wire',
        sourceId: wire.id,
        code: 'WIRE_ORPHAN_SOURCE',
        message: `Source component "${wire.sourceComponentId}" does not exist in project`,
        severity: 'error',
      });
    }
    if (!componentIds.has(wire.targetComponentId)) {
      reports.push({
        sourceType: 'wire',
        sourceId: wire.id,
        code: 'WIRE_ORPHAN_TARGET',
        message: `Target component "${wire.targetComponentId}" does not exist in project`,
        severity: 'error',
      });
    }
  }

  const netMap = new Map<string, WireConnection[]>();
  for (const wire of project.wires) {
    const netId = wire.netId ?? wire.id;
    if (!netMap.has(netId)) {
      netMap.set(netId, []);
    }
    netMap.get(netId)!.push(wire);
  }

  for (const [netId, netWires] of netMap) {
    if (netWires.length > 1) {
      const netResult = validateNet(netWires);
      for (const err of netResult.errors) {
        reports.push({
          sourceType: 'wire',
          sourceId: netId,
          code: err.code,
          message: err.message,
          severity: 'error',
        });
      }
      for (const warn of netResult.warnings) {
        reports.push({
          sourceType: 'wire',
          sourceId: netId,
          code: warn.code,
          message: warn.message,
          severity: 'warning',
        });
      }
    }
  }

  if (board) {
    for (const wire of project.wires) {
      const result = validateWireConnection(wire, board, project.components);
      for (const err of result.errors) {
        reports.push({
          sourceType: 'wire',
          sourceId: wire.id,
          code: err.code,
          message: err.message,
          severity: 'error',
        });
      }
      for (const warn of result.warnings) {
        reports.push({
          sourceType: 'wire',
          sourceId: wire.id,
          code: warn.code,
          message: warn.message,
          severity: 'warning',
        });
      }
    }
  }

  return reports;
}
