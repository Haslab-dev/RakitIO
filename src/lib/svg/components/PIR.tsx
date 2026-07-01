interface PIRProps {
  motion?: boolean;
  x: number;
  y: number;
  rotation?: number;
}

export function PIR({ motion = false, x, y, rotation = 0 }: PIRProps) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <defs>
        <linearGradient id="pir-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <radialGradient id="pir-sensor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={motion ? '#22C55E' : '#334155'} />
          <stop offset="100%" stopColor={motion ? '#16A34A' : '#1E293B'} />
        </radialGradient>
      </defs>

      <rect x={-35} y={-30} width={70} height={90} rx={5} fill="url(#pir-body)" stroke="#334155" strokeWidth={1.5} />

      <rect x={-28} y={-22} width={56} height={35} rx={3} fill="#0F172A" stroke="#1E293B" strokeWidth={1} />

      <circle cx={0} cy={-8} r={12} fill="url(#pir-sensor)" stroke={motion ? '#22C55E' : '#334155'} strokeWidth={2} className="pir-sensor" />

      <circle cx={0} cy={-8} r={6} fill="#0F172A" />
      <circle cx={0} cy={-8} r={2} fill={motion ? '#4ADE80' : '#475569'} />

      {motion && (
        <>
          <circle cx={0} cy={-8} r={20} fill="none" stroke="#22C55E" strokeWidth={1} opacity={0.3} />
          <circle cx={0} cy={-8} r={26} fill="none" stroke="#22C55E" strokeWidth={1} opacity={0.15} />
        </>
      )}

      <rect x={-20} y={20} width={40} height={6} rx={2} fill="#1E293B" />

      <text x={0} y={35} fontSize={6} fill={motion ? '#22C55E' : '#94A3B8'} fontFamily="monospace" fontWeight="bold" textAnchor="middle">
        {motion ? 'MOTION' : 'STANDBY'}
      </text>

      <circle cx={-12} cy={-5} r={3} fill={motion ? '#22C55E' : '#4B5563'} stroke="#6B7280" strokeWidth={1} className="pir-led" />

      <text x={0} y={-38} fontSize={6} fill="#94A3B8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">PIR HC-SR501</text>

      <line x1={-35} y1={50} x2={-50} y2={50} stroke="#C0C0C0" strokeWidth={2} />
      <line x1={-35} y1={62} x2={-50} y2={62} stroke="#C0C0C0" strokeWidth={2} />
      <line x1={35} y1={62} x2={50} y2={62} stroke="#C0C0C0" strokeWidth={2} />

      <rect x={-37} y={48} width={4} height={4} fill="#6B7280" />
      <rect x={-37} y={60} width={4} height={4} fill="#6B7280" />
      <rect x={33} y={60} width={4} height={4} fill="#6B7280" />

      <text x={-56} y={48} fontSize={4.5} fill="#9CA3AF" fontFamily="monospace" textAnchor="end">VCC</text>
      <text x={-56} y={64} fontSize={4.5} fill="#9CA3AF" fontFamily="monospace" textAnchor="end">OUT</text>
      <text x={56} y={64} fontSize={4.5} fill="#9CA3AF" fontFamily="monospace" textAnchor="start">GND</text>
    </g>
  );
}
