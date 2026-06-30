import type { PinDefinition } from '../../types';
import { PinRenderer } from '../PinRenderer';
import { useSimulationStore } from '../../../lib/stores';

interface ArduinoUnoProps {
  pins: PinDefinition[];
  onPinClick?: (pinId: string) => void;
  selectedPins?: string[];
}

export function ArduinoUno({ pins, onPinClick, selectedPins = [] }: ArduinoUnoProps) {
  const boardW = 380;
  const boardH = 440;

  const simState = useSimulationStore((s) => s.state);
  const simSnapshot = useSimulationStore((s) => s.snapshot);

  // Find pin D13 value in simulation snapshot
  const pin13Val = (simSnapshot as any)?.nets
    ?.flatMap((n: any) => n.pins)
    .find((p: any) => p.componentId === 'board' && p.pinId === 'D13')
    ?.value ?? 0;

  const isPowerOn = simState === 'running';
  const isBuiltInLEDOn = pin13Val > 1.5;

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
        [15, 120], [boardW - 15, 70],
        [15, boardH - 60], [boardW - 15, boardH - 60],
      ].map(([hx, hy], i) => (
        <circle key={`hole-${i}`} cx={hx} cy={hy} r={3.5} fill="#0A1628" stroke="#5D6D7E" strokeWidth={0.8} />
      ))}

      {/* USB connector (Top-Left, pointing up) */}
      <rect x={40} y={-10} width={60} height={70} rx={3} fill="#C0C0C0" stroke="#A0A0A0" strokeWidth={1} />
      <rect x={46} y={-10} width={48} height={14} rx={1} fill="#808080" />

      {/* Power jack (Bottom-Left, pointing left) */}
      <rect x={-15} y={310} width={55} height={45} rx={4} fill="#1A1A1A" stroke="#333" strokeWidth={1} />
      <circle cx={10} cy={332} r={6} fill="#333" stroke="#555" strokeWidth={0.5} />

      {/* ATmega328P DIP-28 chip (Center-Right, vertical) */}
      <rect x={160} y={130} width={38} height={170} rx={2} fill="#1A1A1A" stroke="#333" strokeWidth={1.5} />
      <rect x={165} y={135} width={28} height={160} rx={1} fill="#222" />
      {/* Chip notch */}
      <circle cx={179} cy={135} r={4} fill="#1A1A1A" stroke="#444" strokeWidth={0.5} />
      {/* Chip pins */}
      {Array.from({ length: 14 }, (_, i) => (
        <g key={`pins-${i}`}>
          <rect x={153} y={142 + i * 11} width={8} height={3} fill="#C0C0C0" />
          <rect x={197} y={142 + i * 11} width={8} height={3} fill="#C0C0C0" />
        </g>
      ))}
      <text x={179} y={210} textAnchor="middle" fontSize={8} fill="#8B9DAF" fontFamily="monospace" fontWeight="bold" transform="rotate(-90 179 210)">
        ATmega328P-PU
      </text>

      {/* Crystal (Metal Can) */}
      <rect x={115} y={115} width={10} height={20} rx={5} fill="#C0C0C0" stroke="#999" strokeWidth={0.5} />
      <text x={120} y={127} textAnchor="middle" fontSize={4} fill="#666" transform="rotate(-90 120 127)">16.000</text>

      {/* Reset button (Top-Right) */}
      <rect x={boardW - 40} y={30} width={18} height={18} rx={2} fill="#333" stroke="#555" strokeWidth={0.5} />
      <circle cx={boardW - 31} cy={39} r={5} fill="#EF4444" />
      <text x={boardW - 31} y={55} textAnchor="middle" fontSize={5} fill="#8B9DAF">RESET</text>

      {/* Black Plastic Header Sockets (Vertical) */}
      {/* Left Headers (Power & Analog) */}
      <rect x={27} y={122} width={16} height={128} rx={1.5} fill="#151515" stroke="#2D2D2D" strokeWidth={0.8} />
      <rect x={27} y={267} width={16} height={98} rx={1.5} fill="#151515" stroke="#2D2D2D" strokeWidth={0.8} />
      {/* Right Headers (Digital) */}
      <rect x={337} y={77} width={16} height={158} rx={1.5} fill="#151515" stroke="#2D2D2D" strokeWidth={0.8} />
      <rect x={337} y={240} width={16} height={128} rx={1.5} fill="#151515" stroke="#2D2D2D" strokeWidth={0.8} />

      {/* Silkscreen Labels - Left Headers (Power & Analog) */}
      {[
        { text: 'IOREF', y: 147 }, { text: 'RESET', y: 162 }, { text: '3.3V', y: 177 }, { text: '5V', y: 192 },
        { text: 'GND', y: 207 }, { text: 'GND', y: 222 }, { text: 'VIN', y: 237 }
      ].map((lbl, i) => (
        <text key={`ll-${i}`} x={52} y={lbl.y} textAnchor="start" fontSize={5.5} fill="#E2E8F0" opacity={0.85} fontFamily="monospace" fontWeight="bold">
          {lbl.text}
        </text>
      ))}
      {[
        { text: 'A0', y: 277 }, { text: 'A1', y: 290 }, { text: 'A2', y: 305 }, { text: 'A3', y: 320 },
        { text: 'A4', y: 335 }, { text: 'A5', y: 350 }
      ].map((lbl, i) => (
        <text key={`la-${i}`} x={52} y={lbl.y} textAnchor="start" fontSize={5.5} fill="#E2E8F0" opacity={0.85} fontFamily="monospace" fontWeight="bold">
          {lbl.text}
        </text>
      ))}

      {/* Silkscreen Labels - Right Headers (Digital) */}
      {[
        { text: 'SCL', y: 87 }, { text: 'SDA', y: 102 }, { text: 'AREF', y: 117 }, { text: 'GND', y: 132 },
        { text: '13', y: 147 }, { text: '12', y: 162 }, { text: '11', y: 177 }, { text: '10', y: 192 },
        { text: '9', y: 207 }, { text: '8', y: 222 }
      ].map((lbl, i) => (
        <text key={`rtd-${i}`} x={328} y={lbl.y} textAnchor="end" fontSize={5.5} fill="#E2E8F0" opacity={0.85} fontFamily="monospace" fontWeight="bold">
          {lbl.text}
        </text>
      ))}
      {[
        { text: '7', y: 250 }, { text: '6', y: 265 }, { text: '5', y: 280 }, { text: '4', y: 295 },
        { text: '3', y: 310 }, { text: '2', y: 325 }, { text: 'TX->1', y: 340 }, { text: 'RX<-0', y: 355 }
      ].map((lbl, i) => (
        <text key={`rbd-${i}`} x={328} y={lbl.y} textAnchor="end" fontSize={5.5} fill="#E2E8F0" opacity={0.85} fontFamily="monospace" fontWeight="bold">
          {lbl.text}
        </text>
      ))}

      {/* LED indicator (Built-in L LED - Placed next to Pin 13) */}
      <circle 
        cx={305} 
        cy={145} 
        r={3} 
        fill={isBuiltInLEDOn ? '#F59E0B' : '#7F6000'} 
        style={{ transition: 'fill 0.1s ease' }} 
      />
      {isBuiltInLEDOn && (
        <circle 
          cx={305} 
          cy={145} 
          r={6} 
          fill="none" 
          stroke="#F59E0B" 
          strokeWidth={0.8} 
          opacity={0.6} 
        />
      )}
      <text x={305} y={155} textAnchor="middle" fontSize={5.5} fill="#8B9DAF">L</text>

      {/* Power LED (ON) */}
      <circle 
        cx={305} 
        cy={105} 
        r={3} 
        fill={isPowerOn ? '#22C55E' : '#145A32'} 
        style={{ transition: 'fill 0.2s ease' }} 
      />
      {isPowerOn && (
        <circle 
          cx={305} 
          cy={105} 
          r={5} 
          fill="none" 
          stroke="#22C55E" 
          strokeWidth={0.8} 
          opacity={0.5} 
        />
      )}
      <text x={305} y={115} textAnchor="middle" fontSize={5.5} fill="#8B9DAF">ON</text>

      {/* Area headers */}
      <text x={65} y={358} textAnchor="start" fontSize={6.5} fill="#5B7A8F" fontFamily="monospace" fontWeight="bold" opacity={0.7} transform="rotate(-90 65 358)">
        ANALOG IN
      </text>
      <text x={65} y={235} textAnchor="start" fontSize={6.5} fill="#5B7A8F" fontFamily="monospace" fontWeight="bold" opacity={0.7} transform="rotate(-90 65 235)">
        POWER
      </text>
      <text x={315} y={145} textAnchor="end" fontSize={6.5} fill="#5B7A8F" fontFamily="monospace" fontWeight="bold" opacity={0.7} transform="rotate(-90 315 145)">
        DIGITAL (PWM~)
      </text>

      {/* Board label */}
      <text x={boardW / 2} y={boardH - 25} textAnchor="middle" fontSize={13} fill="#4A90B8" fontFamily="sans-serif" fontWeight="bold">
        ARDUINO UNO
      </text>
      <text x={boardW / 2} y={boardH - 12} textAnchor="middle" fontSize={7} fill="#3A7A9E" fontFamily="monospace">
        Rev3
      </text>

      {/* Render all pins from definition */}
      {pins.map(renderPin)}
    </svg>
  );
}
