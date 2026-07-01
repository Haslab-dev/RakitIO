interface RelayProps {
  active?: boolean;
  x: number;
  y: number;
  rotation?: number;
}

export function Relay({ active = false, x, y, rotation = 0 }: RelayProps) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <defs>
        <linearGradient id="relay-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#1F2937" />
        </linearGradient>
        <filter id="relay-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
        </filter>
      </defs>

      <rect x={-30} y={-25} width={60} height={90} rx={4} fill="url(#relay-body)" stroke="#4B5563" strokeWidth={2} filter="url(#relay-shadow)" />

      <rect x={-22} y={-18} width={44} height={30} rx={2} fill="#111827" stroke="#374151" strokeWidth={1} />

      <circle cx={-12} cy={-8} r={6} fill={active ? '#22C55E' : '#4B5563'} stroke="#6B7280" strokeWidth={1} />
      <text x={0} y={-5} fontSize={8} fill={active ? '#22C55E' : '#9CA3AF'} fontFamily="monospace" fontWeight="bold">
        {active ? 'ON' : 'OFF'}
      </text>

      <line x1={-12} y1={0} x2={-12} y2={12} stroke={active ? '#22C55E' : '#6B7280'} strokeWidth={2} className="relay-arm" />

      <rect x={-22} y={35} width={44} height={8} rx={2} fill="#4B5563" />
      <text x={0} y={42} fontSize={5} fill="#9CA3AF" fontFamily="monospace" textAnchor="middle">5V DC</text>

      <text x={0} y={-30} fontSize={7} fill="#D1D5DB" fontFamily="monospace" fontWeight="bold" textAnchor="middle">RELAY</text>
      <text x={0} y={55} fontSize={5} fill="#6B7280" fontFamily="monospace" textAnchor="middle">SRD-05VDC-SL-C</text>

      <line x1={-30} y1={-10} x2={-45} y2={-10} stroke="#9CA3AF" strokeWidth={2} />
      <line x1={-30} y1={5} x2={-45} y2={5} stroke="#9CA3AF" strokeWidth={2} />
      <line x1={-30} y1={50} x2={-45} y2={50} stroke="#EF4444" strokeWidth={2} />

      <line x1={30} y1={50} x2={45} y2={50} stroke="#9CA3AF" strokeWidth={2} />
      <line x1={30} y1={60} x2={45} y2={60} stroke="#9CA3AF" strokeWidth={2} />

      <text x={-52} y={-8} fontSize={5} fill="#9CA3AF" fontFamily="monospace" textAnchor="end">VCC</text>
      <text x={-52} y={7} fontSize={5} fill="#9CA3AF" fontFamily="monospace" textAnchor="end">IN</text>
      <text x={-52} y={52} fontSize={5} fill="#EF4444" fontFamily="monospace" textAnchor="end">GND</text>

      <text x={52} y={52} fontSize={5} fill="#9CA3AF" fontFamily="monospace" textAnchor="start">COM</text>
      <text x={52} y={62} fontSize={5} fill="#9CA3AF" fontFamily="monospace" textAnchor="start">NO</text>

      <rect x={-32} y={-12} width={4} height={4} rx={1} fill="#6B7280" />
      <rect x={-32} y={3} width={4} height={4} rx={1} fill="#6B7280" />
      <rect x={-32} y={48} width={4} height={4} rx={1} fill="#6B7280" />
      <rect x={28} y={48} width={4} height={4} rx={1} fill="#6B7280" />
      <rect x={28} y={58} width={4} height={4} rx={1} fill="#6B7280" />
    </g>
  );
}
