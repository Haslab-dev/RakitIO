interface LEDProps {
  color?: string;
  on?: boolean;
  x: number;
  y: number;
  rotation?: number;
}

export function LED({ color = '#EF4444', on = false, x, y, rotation = 0 }: LEDProps) {
  // Flat bulb color
  const bulbFill = on ? color : '#374151';
  const bulbStroke = on ? color : '#4B5563';

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* Solder/Lead wires */}
      <line x1={-4} y1={25} x2={-4} y2={6} stroke="#6B7280" strokeWidth={3} strokeLinecap="round" />
      <line x1={4} y1={25} x2={4} y2={6} stroke="#6B7280" strokeWidth={3} strokeLinecap="round" />

      {/* Flat Glow effect when on */}
      {on && (
        <circle cx={0} cy={-2} r={24} fill={color} opacity={0.15} className="animate-pulse" />
      )}

      {/* LED Bulb (Flat design: rounded top, flat bottom) */}
      <path
        d="M -10,8 L -10,0 A 10,10 0 0,1 10,0 L 10,8 Z"
        fill={bulbFill}
        stroke={bulbStroke}
        strokeWidth={2}
        style={{ transition: 'fill 0.15s ease, stroke 0.15s ease' }}
      />
      {/* Flat internal base line */}
      <line x1={-9} y1={7} x2={9} y2={7} stroke={on ? '#FFF' : '#4B5563'} strokeWidth={1} opacity={0.4} />

      {/* Text labels for Pin Identification */}
      <text x={7} y={20} fontSize={6} fill="#9CA3AF" fontFamily="monospace" fontWeight="bold">A</text>
      <text x={-11} y={20} fontSize={6} fill="#9CA3AF" fontFamily="monospace" fontWeight="bold">K</text>
    </g>
  );
}
