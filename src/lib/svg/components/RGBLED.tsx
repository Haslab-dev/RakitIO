interface RGBLEDProps {
  r?: number;
  g?: number;
  b?: number;
  x: number;
  y: number;
  rotation?: number;
}

export function RGBLED({ r = 0, g = 0, b = 0, x, y, rotation = 0 }: RGBLEDProps) {
  const color = `rgb(${r}, ${g}, ${b})`;
  const isOn = r > 0 || g > 0 || b > 0;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <defs>
        <radialGradient id="rgb-dome-gradient" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={isOn ? '#FFFFFF' : '#4B5563'} stopOpacity={isOn ? 0.4 : 0.2} />
          <stop offset="40%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity={0.7} />
        </radialGradient>
        <filter id="rgb-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {isOn && (
        <g>
          <circle cx={0} cy={0} r={28} fill={color} opacity={0.2} />
          <circle cx={0} cy={0} r={20} fill={color} opacity={0.3} filter="url(#rgb-glow)" />
        </g>
      )}

      <ellipse cx={0} cy={-2} rx={12} ry={13} fill="url(#rgb-dome-gradient)" />

      <ellipse cx={-3} cy={-7} rx={4} ry={2.5} fill="white" opacity={isOn ? 0.5 : 0.15} />

      <path d="M -9,9 Q -11,13 -9,17 L 9,17 Q 11,13 9,9 Z" fill="#4B5563" />

      <line x1={-5} y1={17} x2={-5} y2={36} stroke="#C0C0C0" strokeWidth={1.5} />
      <line x1={0} y1={17} x2={0} y2={36} stroke="#C0C0C0" strokeWidth={1.5} />
      <line x1={5} y1={17} x2={5} y2={36} stroke="#C0C0C0" strokeWidth={1.5} />

      <rect x={-6.5} y={34} width={3} height={5} fill="#9CA3AF" />
      <rect x={-1.5} y={34} width={3} height={5} fill="#9CA3AF" />
      <rect x={3.5} y={34} width={3} height={5} fill="#9CA3AF" />

      <text x={-5} y={44} fontSize={5} fill="#EF4444" fontFamily="monospace" fontWeight="bold" textAnchor="middle">R</text>
      <text x={0} y={44} fontSize={5} fill="#22C55E" fontFamily="monospace" fontWeight="bold" textAnchor="middle">G</text>
      <text x={5} y={44} fontSize={5} fill="#3B82F6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">B</text>

      <text x={12} y={-5} fontSize={5} fill="#6B7280" fontFamily="monospace" textAnchor="start">RGB</text>
    </g>
  );
}
