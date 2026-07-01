interface BuzzerProps {
  active?: boolean;
  frequency?: number;
  x: number;
  y: number;
  rotation?: number;
}

export function Buzzer({ active = false, frequency = 0, x, y, rotation = 0 }: BuzzerProps) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <defs>
        <radialGradient id="buzzer-top" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor={active ? '#8B5CF6' : '#4B5563'} />
          <stop offset="100%" stopColor={active ? '#6D28D9' : '#1F2937'} />
        </radialGradient>
        <filter id="buzzer-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>{`
          .buzzer-wave-anim {
            animation: buzzer-pulse 0.15s ease-in-out infinite alternate;
          }
          @keyframes buzzer-pulse {
            from { r: 22; opacity: 0.6; }
            to { r: 28; opacity: 0.2; }
          }
          .buzzer-vibrate {
            animation: buzzer-shake 0.05s linear infinite;
          }
          @keyframes buzzer-shake {
            0% { transform: translateX(0); }
            50% { transform: translateX(0.5px); }
            100% { transform: translateX(-0.5px); }
          }
        `}</style>
      </defs>

      {active && (
        <circle cx={0} cy={0} r={22} fill="#8B5CF6" opacity={0.2} filter="url(#buzzer-glow)" className="buzzer-wave-anim" />
      )}

      <g className={active ? 'buzzer-vibrate' : ''}>
        <circle cx={0} cy={0} r={22} fill="url(#buzzer-top)" stroke="#4B5563" strokeWidth={2} />
      </g>

      <circle cx={0} cy={0} r={8} fill="#1F2937" stroke="#374151" strokeWidth={1} />
      <circle cx={0} cy={0} r={3} fill={active ? '#8B5CF6' : '#4B5563'} />

      <rect x={-4} y={20} width={8} height={4} rx={1} fill="#6B7280" />

      <line x1={0} y1={24} x2={0} y2={40} stroke="#C0C0C0" strokeWidth={2} />
      <line x1={12} y1={24} x2={12} y2={40} stroke="#C0C0C0" strokeWidth={2} />

      <rect x={-2} y={38} width={4} height={4} fill="#9CA3AF" />
      <rect x={10} y={38} width={4} height={4} fill="#9CA3AF" />

      <text x={0} y={-28} fontSize={5} fill={active ? '#8B5CF6' : '#9CA3AF'} fontFamily="monospace" fontWeight="bold" textAnchor="middle">
        {active ? `${Math.round(frequency)}Hz` : 'BUZZER'}
      </text>

      <text x={-14} y={44} fontSize={5} fill="#9CA3AF" fontFamily="monospace" textAnchor="middle">+</text>
      <text x={18} y={44} fontSize={5} fill="#9CA3AF" fontFamily="monospace" textAnchor="middle">-</text>

      {active && (
        <text x={0} y={8} fontSize={6} fill="#C4B5FD" fontFamily="sans-serif" textAnchor="middle">
          ♪
        </text>
      )}
    </g>
  );
}
