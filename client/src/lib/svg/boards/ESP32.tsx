import type { PinDefinition } from '../../types';
import { PinRenderer } from '../PinRenderer';
import { useSimulationStore } from '../../../lib/stores';

interface ESP32DevKitProps {
  pins: PinDefinition[];
  onPinClick?: (pinId: string) => void;
  selectedPins?: string[];
}

export function ESP32DevKit({ pins, onPinClick, selectedPins = [] }: ESP32DevKitProps) {
  const boardW = 400;
  const boardH = 580;

  const simState = useSimulationStore((s) => s.state);
  const simSnapshot = useSimulationStore((s) => s.snapshot);

  // Find pin GPIO2 value in simulation snapshot (ESP32 built-in LED is on GPIO 2)
  const pin2Val = (simSnapshot as any)?.nets
    ?.flatMap((n: any) => n.pins)
    .find((p: any) => p.componentId === 'board' && (p.pinId === 'GPIO2' || p.pinId === '2' || p.pinId === 'D2'))
    ?.value ?? 0;

  const isPowerOn = simState === 'running';
  const isBuiltInLEDOn = pin2Val > 1.5;

  const renderPin = (pin: PinDefinition) => (
    <PinRenderer
      key={pin.id}
      x={pin.x}
      y={pin.y}
      mode={pin.mode}
      selected={selectedPins.includes(pin.id)}
      onClick={() => onPinClick?.(pin.id)}
      label={pin.name}
      radius={5}
    />
  );

  return (
    <svg width={boardW + 40} height={boardH + 40} viewBox={`-20 -20 ${boardW + 40} ${boardH + 40}`}>
      <defs>
        <linearGradient id="esp32-pcb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1A1A2E" />
          <stop offset="50%" stopColor="#16213E" />
          <stop offset="100%" stopColor="#0F3460" />
        </linearGradient>
        <filter id="esp32-shadow">
          <feDropShadow dx="2" dy="3" stdDeviation="4" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Board body */}
      <rect
        x={0} y={0}
        width={boardW} height={boardH}
        rx={4} ry={4}
        fill="url(#esp32-pcb)"
        stroke="#0A1628"
        strokeWidth={2}
        filter="url(#esp32-shadow)"
      />

      {/* USB-C connector */}
      <rect x={boardW / 2 - 22} y={-4} width={44} height={24} rx={4} ry={4} fill="#C0C0C0" stroke="#A0A0A0" strokeWidth={1} />
      <rect x={boardW / 2 - 16} y={2} width={32} height={12} rx={2} ry={2} fill="#808080" />
      <rect x={boardW / 2 - 10} y={5} width={20} height={6} rx={1} ry={1} fill="#606060" />

      {/* ESP32-WROOM-32 module (metal shield) */}
      <rect
        x={boardW / 2 - 55}
        y={80}
        width={110}
        height={80}
        rx={3} ry={3}
        fill="#C0C0C0"
        stroke="#A0A0A0"
        strokeWidth={1.5}
      />
      {/* Shield texture lines */}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`shield-${i}`} x1={boardW / 2 - 50} y1={90 + i * 8} x2={boardW / 2 + 50} y2={90 + i * 8} stroke="#B0B0B0" strokeWidth={0.3} />
      ))}
      {/* Antenna trace */}
      <path
        d={`M ${boardW / 2 - 30} 85 Q ${boardW / 2 - 50} 85, ${boardW / 2 - 50} 100 L ${boardW / 2 - 50} 120 Q ${boardW / 2 - 50} 135, ${boardW / 2 - 35} 135`}
        fill="none"
        stroke="#D0D0D0"
        strokeWidth={2}
      />
      {/* Module label */}
      <text x={boardW / 2} y={125} textAnchor="middle" fontSize={8} fill="#666" fontFamily="monospace" fontWeight="bold">
        ESP32-WROOM-32
      </text>
      <text x={boardW / 2} y={137} textAnchor="middle" fontSize={6} fill="#888" fontFamily="monospace">
        32Mbit
      </text>

      {/* EN button */}
      <rect x={boardW / 2 + 70} y={90} width={12} height={10} rx={2} fill="#333" stroke="#555" strokeWidth={0.5} />
      <rect x={boardW / 2 + 72} y={92} width={8} height={6} rx={1} fill="#555" />
      <text x={boardW / 2 + 76} y={110} textAnchor="middle" fontSize={5} fill="#8B9DAF">EN</text>

      {/* BOOT button */}
      <rect x={boardW / 2 + 70} y={120} width={12} height={10} rx={2} fill="#333" stroke="#555" strokeWidth={0.5} />
      <rect x={boardW / 2 + 72} y={122} width={8} height={6} rx={1} fill="#555" />
      <text x={boardW / 2 + 76} y={140} textAnchor="middle" fontSize={5} fill="#8B9DAF">BOOT</text>

      {/* Power LED */}
      <circle 
        cx={boardW / 2 - 80} 
        cy={100} 
        r={3} 
        fill={isPowerOn ? '#EF4444' : '#6B1D1D'} 
        style={{ transition: 'fill 0.2s ease' }} 
      />
      {isPowerOn && (
        <circle 
          cx={boardW / 2 - 80} 
          cy={100} 
          r={5} 
          fill="none" 
          stroke="#EF4444" 
          strokeWidth={0.8} 
          opacity={0.5} 
        />
      )}
      <text x={boardW / 2 - 80} y={112} textAnchor="middle" fontSize={5} fill="#8B9DAF">PWR</text>

      {/* Built-in LED */}
      <circle 
        cx={boardW / 2 - 80} 
        cy={130} 
        r={3} 
        fill={isBuiltInLEDOn ? '#3B82F6' : '#1D3B6B'} 
        style={{ transition: 'fill 0.1s ease' }} 
      />
      {isBuiltInLEDOn && (
        <circle 
          cx={boardW / 2 - 80} 
          cy={130} 
          r={6} 
          fill="none" 
          stroke="#3B82F6" 
          strokeWidth={0.8} 
          opacity={0.6} 
        />
      )}
      <text x={boardW / 2 - 80} y={142} textAnchor="middle" fontSize={5} fill="#8B9DAF">LED</text>

      {/* Voltage regulator */}
      <rect x={boardW / 2 - 60} y={boardH - 60} width={20} height={14} rx={1} fill="#222" stroke="#444" strokeWidth={0.5} />
      <text x={boardW / 2 - 50} y={boardH - 50} textAnchor="middle" fontSize={4} fill="#888">AMS1117</text>

      {/* CP2102 USB-UART chip */}
      <rect x={boardW / 2 + 20} y={boardH - 65} width={24} height={20} rx={1} fill="#1A1A1A" stroke="#333" strokeWidth={0.5} />
      <text x={boardW / 2 + 32} y={boardH - 52} textAnchor="middle" fontSize={4} fill="#888">CP2102</text>

      {/* Board label */}
      <text x={boardW / 2} y={boardH / 2 + 40} textAnchor="middle" fontSize={12} fill="#4A6FA5" fontFamily="sans-serif" fontWeight="bold">
        ESP32 DevKit V1
      </text>
      <text x={boardW / 2} y={boardH / 2 + 55} textAnchor="middle" fontSize={7} fill="#3A5A8E" fontFamily="monospace">
        30 Pin / DOIT
      </text>

      {/* Left side silkscreen labels (15 pins) */}
      {['3V3', 'EN', 'SVP', 'SVN', '34', '35', '32', '33', '25', '26', '27', '14', '12', 'GND', '13'].map((label, i) => (
        <text key={`lbl-${i}`} x={48} y={208 + i * 17} textAnchor="end" fontSize={6} fill="#A2D2FF" opacity={0.8} fontFamily="monospace" fontWeight="bold">
          {label}
        </text>
      ))}

      {/* Right side silkscreen labels (15 pins) */}
      {['VIN', 'GND', '15', '2', '4', '16', '17', '5', '18', '19', '21', 'RX', 'TX', '22', '23'].map((label, i) => (
        <text key={`rrl-${i}`} x={boardW - 48} y={208 + i * 17} textAnchor="start" fontSize={6} fill="#A2D2FF" opacity={0.8} fontFamily="monospace" fontWeight="bold">
          {label}
        </text>
      ))}

      {/* Pin headers - left side holes */}
      {Array.from({ length: 15 }, (_, i) => (
        <rect key={`lp-${i}`} x={28} y={200 + i * 17} width={8} height={12} rx={1} fill="#D4A843" stroke="#B8922E" strokeWidth={0.5} />
      ))}

      {/* Pin headers - right side holes */}
      {Array.from({ length: 15 }, (_, i) => (
        <rect key={`rp-${i}`} x={boardW - 36} y={200 + i * 17} width={8} height={12} rx={1} fill="#D4A843" stroke="#B8922E" strokeWidth={0.5} />
      ))}

      {/* Render all pins from definition */}
      {pins.map(renderPin)}
    </svg>
  );
}
