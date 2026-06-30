export { ArduinoUno } from './Uno';
export { ESP32DevKit } from './ESP32';
export { Breadboard } from './Breadboard';
export { Pico } from './Pico';

import type { PinDefinition } from '../../types';
import { ArduinoUno } from './Uno';
import { ESP32DevKit } from './ESP32';
import { Breadboard } from './Breadboard';
import { Pico } from './Pico';

interface BoardProps {
  pins?: PinDefinition[];
  onPinClick?: (pinId: string) => void;
  selectedPins?: string[];
  width?: number;
  height?: number;
}

export function BoardRenderer({ boardId, ...props }: { boardId: string } & BoardProps) {
  switch (boardId) {
    case 'arduino-uno':
      return <ArduinoUno pins={props.pins || []} onPinClick={props.onPinClick} selectedPins={props.selectedPins} />;
    case 'esp32-devkit-v1':
      return <ESP32DevKit pins={props.pins || []} onPinClick={props.onPinClick} selectedPins={props.selectedPins} />;
    case 'raspberry-pi-pico':
      return <Pico pins={props.pins || []} onPinClick={props.onPinClick} selectedPins={props.selectedPins} />;
    case 'breadboard':
      return <Breadboard width={props.width} height={props.height} />;
    default:
      return (
        <svg width={200} height={100}>
          <rect x={10} y={10} width={180} height={80} rx={4} fill="#1a1a2e" stroke="#333" strokeWidth={2} />
          <text x={100} y={45} textAnchor="middle" fontSize={10} fill="#888" fontFamily="monospace">
            Unknown board
          </text>
          <text x={100} y={60} textAnchor="middle" fontSize={8} fill="#666" fontFamily="monospace">
            {boardId}
          </text>
        </svg>
      );
  }
}
