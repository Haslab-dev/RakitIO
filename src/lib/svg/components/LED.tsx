interface LEDProps {
  color?: string;
  on?: boolean;
  x: number;
  y: number;
  rotation?: number;
}

export function LED({ color = '#EF4444', on = false, x, y, rotation = 0 }: LEDProps) {
  const bulbFill = on ? color : '#374151';
  const bulbStroke = on ? color : '#4B5563';
  const glowColor = color;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <defs>
        <radialGradient id={`led-dome-${color.replace('#', '')}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={on ? '#FFFFFF' : '#9CA3AF'} stopOpacity={on ? 0.5 : 0.2} />
          <stop offset="40%" stopColor={bulbFill} />
          <stop offset="100%" stopColor={bulbStroke} />
        </radialGradient>
        <filter id="led-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="led-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.4" />
        </filter>
      </defs>

      {on && (
        <>
          <circle cx={0} cy={-2} r={32} fill={glowColor} opacity={0.08} className="animate-pulse" />
          <circle cx={0} cy={-2} r={24} fill={glowColor} opacity={0.15} />
          <circle cx={0} cy={-2} r={16} fill={glowColor} opacity={0.25} filter="url(#led-glow)" />
        </>
      )}

      <ellipse cx={0} cy={-2} rx={10} ry={11} fill={`url(#led-dome-${color.replace('#', '')})`} filter="url(#led-shadow)" />
      
      <ellipse cx={0} cy={3} rx={5} ry={2.5} fill={on ? '#1A1A1A' : '#1F1F1F'} />
      
      <ellipse cx={-3} cy={-6} rx={3.5} ry={2} fill="white" opacity={on ? 0.5 : 0.15} />

      <path d="M -8,8 Q -10,11 -8,14 L 8,14 Q 10,11 8,8 Z" fill={bulbStroke} />

      <line x1={-4} y1={14} x2={-4} y2={32} stroke="#C0C0C0" strokeWidth={1.2} />
      <line x1={4} y1={14} x2={4} y2={32} stroke="#C0C0C0" strokeWidth={1.2} />
      <rect x={-5.5} y={30} width={3} height={4} fill="#A0A0A0" />
      <circle cx={4} cy={32} r={1.2} fill="#A0A0A0" />

      <text x={9} y={20} fontSize={5.5} fill="#9CA3AF" fontFamily="monospace" fontWeight="bold">A</text>
      <text x={-12} y={20} fontSize={5.5} fill="#9CA3AF" fontFamily="monospace" fontWeight="bold">K</text>
    </g>
  );
}
