export interface WirePoint {
  x: number;
  y: number;
}

export interface WireSegment {
  id: string;
  points: WirePoint[];
  color: string;
}

export interface WireConnection {
  id: string;
  sourceComponentId: string;
  sourcePinId: string;
  targetComponentId: string;
  targetPinId: string;
  color: string;
  segments: WireSegment[];
  netId?: string;
}

export type WireColor =
  | '#000000'
  | '#ff0000'
  | '#0000ff'
  | '#00ff00'
  | '#ffff00'
  | '#ff8800'
  | '#8800ff'
  | '#00ffff'
  | '#ffffff'
  | '#888888';

export const WIRE_COLORS: WireColor[] = [
  '#000000',
  '#ff0000',
  '#0000ff',
  '#00ff00',
  '#ffff00',
  '#ff8800',
  '#8800ff',
  '#00ffff',
  '#ffffff',
  '#888888',
];
