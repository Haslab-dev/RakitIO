interface ButtonProps {
  pressed?: boolean;
  x: number;
  y: number;
  rotation?: number;
}

export function Button({ pressed = false, x, y, rotation = 0 }: ButtonProps) {
  const bodySize = 32;
  
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* Left/Right Metal Leads */}
      <line x1={-18} y1={0} x2={-14} y2={0} stroke="#9CA3AF" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={18} y1={0} x2={14} y2={0} stroke="#9CA3AF" strokeWidth={2.5} strokeLinecap="round" />

      {/* Button Base (Flat Dark Grey Square) */}
      <rect
        x={-bodySize / 2}
        y={-bodySize / 2}
        width={bodySize}
        height={bodySize}
        rx={4}
        fill="#374151"
        stroke="#4B5563"
        strokeWidth={2}
      />

      {/* Inner Ring */}
      <circle cx={0} cy={0} r={11} fill="none" stroke="#4B5563" strokeWidth={1.2} opacity={0.6} />

      {/* Button Plunger Cap (Circular, shrinks and darkens on press) */}
      <circle
        cx={0}
        cy={0}
        r={pressed ? 7.5 : 9}
        fill={pressed ? '#1F2937' : '#EF4444'}
        stroke={pressed ? '#EF4444' : '#DC2626'}
        strokeWidth={1.5}
        style={{ transition: 'all 0.08s ease' }}
      />

      {/* Pin Numbers */}
      <text x={-15} y={-7} fontSize={6} fill="#9CA3AF" fontFamily="monospace" fontWeight="bold">1</text>
      <text x={11} y={-7} fontSize={6} fill="#9CA3AF" fontFamily="monospace" fontWeight="bold">2</text>
    </g>
  );
}
