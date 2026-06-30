import type { PinDefinition } from '../../types';
import { PinRenderer } from '../PinRenderer';

interface PicoProps {
  pins: PinDefinition[];
  onPinClick?: (pinId: string) => void;
  selectedPins?: string[];
}

export function Pico({ pins, onPinClick, selectedPins = [] }: PicoProps) {
  const boardW = 220;
  const boardH = 460;

  const renderPin = (pin: PinDefinition) => (
    <PinRenderer
      key={pin.id}
      x={pin.x}
      y={pin.y}
      mode={pin.mode}
      selected={selectedPins.includes(pin.id)}
      onClick={() => onPinClick?.(pin.id)}
      label={pin.name}
      radius={4}
    />
  );

  return (
    <svg width={boardW + 40} height={boardH + 40} viewBox={`-20 -20 ${boardW + 40} ${boardH + 40}`}>
      <defs>
        <linearGradient id="pico-pcb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D6A4F" />
          <stop offset="50%" stopColor="#1B4332" />
          <stop offset="100%" stopColor="#143327" />
        </linearGradient>
        <filter id="pico-shadow">
          <feDropShadow dx="2" dy="3" stdDeviation="4" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Board body with distinctive Pico shape (rounded ends) */}
      <path
        d={`M ${boardW / 2} 0 
            Q ${boardW} 0, ${boardW} 30 
            L ${boardW} ${boardH - 30} 
            Q ${boardW} ${boardH}, ${boardW / 2} ${boardH} 
            Q 0 ${boardH}, 0 ${boardH - 30} 
            L 0 30 
            Q 0 0, ${boardW / 2} 0 Z`}
        fill="url(#pico-pcb)"
        stroke="#0B2618"
        strokeWidth={2}
        filter="url(#pico-shadow)"
      />

      {/* USB Micro connector */}
      <rect x={boardW / 2 - 18} y={-2} width={36} height={18} rx={3} ry={3} fill="#C0C0C0" stroke="#A0A0A0" strokeWidth={1} />
      <rect x={boardW / 2 - 12} y={3} width={24} height={8} rx={2} ry={2} fill="#808080" />
      <rect x={boardW / 2 - 8} y={5} width={16} height={4} rx={1} ry={1} fill="#606060" />

      {/* RP2040 chip */}
      <rect
        x={boardW / 2 - 28}
        y={boardH / 2 - 25}
        width={56}
        height={50}
        rx={2} ry={2}
        fill="#1A1A1A"
        stroke="#333"
        strokeWidth={1.5}
      />
      {/* QFN pad pattern */}
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={`rp-l-${i}`} x={boardW / 2 - 33} y={boardH / 2 - 20 + i * 7} width={6} height={4} rx={0.5} fill="#C0C0C0" />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={`rp-r-${i}`} x={boardW / 2 + 27} y={boardH / 2 - 20 + i * 7} width={6} height={4} rx={0.5} fill="#C0C0C0" />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={`rp-t-${i}`} x={boardW / 2 - 22 + i * 7.5} y={boardH / 2 - 30} width={4} height={6} rx={0.5} fill="#C0C0C0" />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={`rp-b-${i}`} x={boardW / 2 - 22 + i * 7.5} y={boardH / 2 + 24} width={4} height={6} rx={0.5} fill="#C0C0C0" />
      ))}
      {/* Thermal pad */}
      <rect x={boardW / 2 - 15} y={boardH / 2 - 12} width={30} height={24} rx={1} fill="#2A2A2A" />
      <text x={boardW / 2} y={boardH / 2 - 2} textAnchor="middle" fontSize={8} fill="#7B8F6E" fontFamily="monospace" fontWeight="bold">
        RP2040
      </text>
      <text x={boardW / 2} y={boardH / 2 + 10} textAnchor="middle" fontSize={5} fill="#5B7A5E" fontFamily="monospace">
        2MB QSPI
      </text>

      {/* Flash chip */}
      <rect x={boardW / 2 + 35} y={boardH / 2 - 10} width={20} height={14} rx={1} fill="#1A1A1A" stroke="#333" strokeWidth={0.5} />
      <text x={boardW / 2 + 45} y={boardH / 2} textAnchor="middle" fontSize={4} fill="#888">W25Q16</text>

      {/* BOOTSEL button */}
      <circle cx={boardW / 2} cy={boardH / 2 + 55} r={7} fill="#333" stroke="#555" strokeWidth={1} />
      <circle cx={boardW / 2} cy={boardH / 2 + 55} r={4} fill="#555" />
      <text x={boardW / 2} y={boardH / 2 + 70} textAnchor="middle" fontSize={5} fill="#7B8F6E" fontFamily="monospace">
        BOOTSEL
      </text>

      {/* Power LED */}
      <circle cx={boardW / 2 - 35} cy={boardH / 2 + 55} r={2.5} fill="#EF4444" opacity={0.9} />
      <text x={boardW / 2 - 35} y={boardH / 2 + 65} textAnchor="middle" fontSize={4} fill="#7B8F6E">PWR</text>

      {/* Board label */}
      <text x={boardW / 2} y={boardH - 35} textAnchor="middle" fontSize={10} fill="#4A8B6E" fontFamily="sans-serif" fontWeight="bold">
        Raspberry Pi
      </text>
      <text x={boardW / 2} y={boardH - 22} textAnchor="middle" fontSize={12} fill="#5BA87E" fontFamily="sans-serif" fontWeight="bold">
        Pico
      </text>

      {/* Pin markers along edges */}
      {Array.from({ length: 20 }, (_, i) => (
        <g key={`left-mark-${i}`}>
          <line x1={8} y1={40 + i * 19} x2={14} y2={40 + i * 19} stroke="#4A8B6E" strokeWidth={0.5} />
        </g>
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <g key={`right-mark-${i}`}>
          <line x1={boardW - 14} y1={40 + i * 19} x2={boardW - 8} y2={40 + i * 19} stroke="#4A8B6E" strokeWidth={0.5} />
        </g>
      ))}

      {/* Render all pins from definition */}
      {pins.map(renderPin)}
    </svg>
  );
}
