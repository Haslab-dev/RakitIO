interface LDRProps {
  resistance?: number;
  brightness?: number;
  x: number;
  y: number;
  rotation?: number;
}

export function LDR({ resistance = 500, brightness = 0.5, x, y, rotation = 0 }: LDRProps) {
  const isBright = brightness > 0.5 || resistance < 500;
  const indicatorColor = isBright ? '#FDE047' : '#52525B';

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <defs>
        <linearGradient id="ldr-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#1F2937" />
        </linearGradient>
      </defs>

      <rect x={-25} y={-20} width={50} height={70} rx={4} fill="url(#ldr-body)" stroke="#4B5563" strokeWidth={1.5} />

      <rect x={-18} y={-12} width={36} height={24} rx={2} fill="#1F2937" stroke="#374151" strokeWidth={1} />

      <circle cx={0} cy={0} r={8} fill={indicatorColor} stroke="#6B7280" strokeWidth={1} className="ldr-indicator" />

      <rect x={-12} y={20} width={24} height={3} rx={1} fill="#4B5563" />

      <line x1={-10} y1={-5} x2={-10} y2={15} stroke="#9CA3AF" strokeWidth={2} />
      <line x1={10} y1={-5} x2={10} y2={15} stroke="#9CA3AF" strokeWidth={2} />

      <line x1={-10} y1={23} x2={-10} y2={45} stroke="#C0C0C0" strokeWidth={2} />
      <line x1={10} y1={23} x2={10} y2={45} stroke="#C0C0C0" strokeWidth={2} />

      <rect x={-12} y={43} width={4} height={4} fill="#9CA3AF" />
      <rect x={8} y={43} width={4} height={4} fill="#9CA3AF" />

      <text x={0} y={-25} fontSize={5} fill="#9CA3AF" fontFamily="monospace" fontWeight="bold" textAnchor="middle">LDR</text>

      <text x={-16} y={27} fontSize={4.5} fill="#6B7280" fontFamily="monospace" textAnchor="start">VCC</text>
      <text x={14} y={27} fontSize={4.5} fill="#6B7280" fontFamily="monospace" textAnchor="start">OUT</text>

      <text x={0} y={55} fontSize={4} fill="#6B7280" fontFamily="monospace" textAnchor="middle">
        {isBright ? 'BRIGHT' : 'DARK'}
      </text>

      <text x={0} y={-2} fontSize={4} fill="#9CA3AF" fontFamily="monospace" textAnchor="middle">
        {Math.round(brightness * 100)}%
      </text>
    </g>
  );
}
