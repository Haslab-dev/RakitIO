interface PotentiometerProps {
  position?: number;
  x: number;
  y: number;
  rotation?: number;
}

export function Potentiometer({ position = 0.5, x, y, rotation = 0 }: PotentiometerProps) {
  const clampedPos = Math.max(0, Math.min(1, position));
  // Map 0.0-1.0 to -135deg to +135deg
  const angle = -135 + clampedPos * 270;
  const bodyR = 24;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* 3 Metal Lead Pins */}
      <line x1={-12} y1={29} x2={-12} y2={14} stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />
      <line x1={0} y1={29} x2={0} y2={14} stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />
      <line x1={12} y1={29} x2={12} y2={14} stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />

      {/* Outer Dial Base (Flat Dark grey) */}
      <circle cx={0} cy={0} r={bodyR} fill="#374151" stroke="#4B5563" strokeWidth={2} />

      {/* Resistance Arc Indicator */}
      <path
        d="M -15,15 A 20,20 0 1,1 15,15"
        fill="none"
        stroke="#4B5563"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.7}
      />

      {/* Rotating Inner Knob (Rotates based on angle) */}
      <g transform={`rotate(${angle})`}>
        {/* Knob face */}
        <circle cx={0} cy={0} r={16} fill="#1F2937" stroke="#4B5563" strokeWidth={1.5} />
        {/* Position line */}
        <line x1={0} y1={0} x2={0} y2={-14} stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round" />
      </g>

      {/* Angle scale markings */}
      <text x={-19} y={20} fontSize={5.5} fill="#9CA3AF" fontFamily="monospace" textAnchor="middle">0%</text>
      <text x={19} y={20} fontSize={5.5} fill="#9CA3AF" fontFamily="monospace" textAnchor="middle">100%</text>

      {/* Pin identification text */}
      <text x={-12} y={26} fontSize={5} fill="#9CA3AF" fontFamily="monospace" textAnchor="middle" fontWeight="bold">V</text>
      <text x={0} y={26} fontSize={5} fill="#9CA3AF" fontFamily="monospace" textAnchor="middle" fontWeight="bold">W</text>
      <text x={12} y={26} fontSize={5} fill="#9CA3AF" fontFamily="monospace" textAnchor="middle" fontWeight="bold">G</text>
    </g>
  );
}
