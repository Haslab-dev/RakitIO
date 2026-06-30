import type { PinDefinition } from '../../types';
import { PinRenderer } from '../PinRenderer';

interface ArduinoUnoProps {
  pins: PinDefinition[];
  onPinClick?: (pinId: string) => void;
  selectedPins?: string[];
}

export function ArduinoUno({ pins, onPinClick, selectedPins = [] }: ArduinoUnoProps) {
  const boardW = 380;
  const boardH = 440;

  const renderPin = (pin: PinDefinition) => (
    <PinRenderer
      key={pin.id}
      x={pin.x}
      y={pin.y}
      mode={pin.mode}
      selected={selectedPins.includes(pin.id)}
      onClick={() => onPinClick?.(pin.id)}
      label={pin.name}
      radius={6}
    />
  );

  return (
    <svg width={boardW + 40} height={boardH + 40} viewBox={`-20 -20 ${boardW + 40} ${boardH + 40}`}>
      <defs>
        <linearGradient id="uno-pcb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1B6B93" />
          <stop offset="50%" stopColor="#1A5276" />
          <stop offset="100%" stopColor="#154360" />
        </linearGradient>
        <filter id="uno-shadow">
          <feDropShadow dx="2" dy="3" stdDeviation="4" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Board body */}
      <rect
        x={0} y={0}
        width={boardW} height={boardH}
        rx={8} ry={8}
        fill="url(#uno-pcb)"
        stroke="#0E3A52"
        strokeWidth={2}
        filter="url(#uno-shadow)"
      />

      {/* Mounting holes */}
      {[
        [15, 15], [boardW - 15, 15],
        [15, boardH - 15], [boardW - 15, boardH - 15],
        [boardW / 2 - 30, 15], [boardW / 2 + 30, 15],
      ].map(([hx, hy], i) => (
        <circle key={`hole-${i}`} cx={hx} cy={hy} r={3} fill="#0A1628" stroke="#5D6D7E" strokeWidth={0.5} />
      ))}

      {/* USB connector */}
      <rect x={boardW / 2 - 30} y={-2} width={60} height={22} rx={2} ry={2} fill="#C0C0C0" stroke="#A0A0A0" strokeWidth={1} />
      <rect x={boardW / 2 - 24} y={2} width={48} height={14} rx={1} ry={1} fill="#808080" />

      {/* Power jack */}
      <rect x={boardW / 2 + 50} y={2} width={28} height={18} rx={3} ry={3} fill="#1A1A1A" stroke="#333" strokeWidth={1} />
      <circle cx={boardW / 2 + 64} cy={11} r={5} fill="#333" stroke="#555" strokeWidth={0.5} />

      {/* ATmega328P chip */}
      <rect x={boardW / 2 - 45} y={boardH / 2 - 40} width={90} height={80} rx={2} ry={2} fill="#1A1A1A" stroke="#333" strokeWidth={1.5} />
      <rect x={boardW / 2 - 40} y={boardH / 2 - 35} width={80} height={70} rx={1} ry={1} fill="#222" />
      {/* Chip notch */}
      <circle cx={boardW / 2 - 35} cy={boardH / 2 - 30} r={4} fill="#1A1A1A" stroke="#444" strokeWidth={0.5} />
      {/* Chip pins (left/right) */}
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={`chip-l-${i}`} x={boardW / 2 - 50} y={boardH / 2 - 32 + i * 5} width={6} height={3} fill="#C0C0C0" />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={`chip-r-${i}`} x={boardW / 2 + 44} y={boardH / 2 - 32 + i * 5} width={6} height={3} fill="#C0C0C0" />
      ))}
      <text x={boardW / 2} y={boardH / 2 - 5} textAnchor="middle" fontSize={9} fill="#8B9DAF" fontFamily="monospace" fontWeight="bold">
        ATmega328P
      </text>
      <text x={boardW / 2} y={boardH / 2 + 8} textAnchor="middle" fontSize={7} fill="#6B7F92" fontFamily="monospace">
        AU 2048K
      </text>

      {/* Crystal */}
      <rect x={boardW / 2 + 60} y={boardH / 2 - 10} width={16} height={8} rx={2} fill="#C0C0C0" stroke="#999" strokeWidth={0.5} />
      <text x={boardW / 2 + 68} y={boardH / 2 - 3} textAnchor="middle" fontSize={4} fill="#666">16M</text>

      {/* Reset button */}
      <rect x={boardW / 2 + 55} y={boardH / 2 + 30} width={14} height={10} rx={2} fill="#333" stroke="#555" strokeWidth={0.5} />
      <rect x={boardW / 2 + 57} y={boardH / 2 + 32} width={10} height={6} rx={1} fill="#555" />
      <text x={boardW / 2 + 62} y={boardH / 2 + 48} textAnchor="middle" fontSize={6} fill="#8B9DAF">RESET</text>

      {/* LED indicator */}
      <circle cx={boardW / 2 + 80} cy={boardH / 2 + 50} r={3} fill="#EF4444" opacity={0.9} />
      <circle cx={boardW / 2 + 80} cy={boardH / 2 + 50} r={5} fill="none" stroke="#EF4444" strokeWidth={0.5} opacity={0.3} />
      <text x={boardW / 2 + 80} y={boardH / 2 + 64} textAnchor="middle" fontSize={5} fill="#8B9DAF">L</text>

      {/* Power LED */}
      <circle cx={30} cy={boardH / 2 + 50} r={3} fill="#22C55E" opacity={0.9} />
      <text x={30} y={boardH / 2 + 64} textAnchor="middle" fontSize={5} fill="#8B9DAF">ON</text>

      {/* Analog input area label */}
      <text x={45} y={boardH / 2 - 55} fontSize={7} fill="#5B7A8F" fontFamily="monospace" fontWeight="bold">
        ANALOG IN
      </text>

      {/* Digital area label */}
      <text x={boardW - 80} y={boardH / 2 - 55} fontSize={7} fill="#5B7A8F" fontFamily="monospace" fontWeight="bold">
        DIGITAL
      </text>

      {/* Power section label */}
      <text x={45} y={40} fontSize={7} fill="#5B7A8F" fontFamily="monospace" fontWeight="bold">
        POWER
      </text>

      {/* Board label */}
      <text x={boardW / 2} y={boardH - 20} textAnchor="middle" fontSize={14} fill="#4A90B8" fontFamily="sans-serif" fontWeight="bold">
        ARDUINO UNO
      </text>
      <text x={boardW / 2} y={boardH - 8} textAnchor="middle" fontSize={7} fill="#3A7A9E" fontFamily="monospace">
        Rev3
      </text>

      {/* Render all pins from definition */}
      {pins.map(renderPin)}
    </svg>
  );
}
