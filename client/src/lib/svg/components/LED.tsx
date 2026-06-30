
interface LEDProps {
  color?: string;
  on?: boolean;
  x: number;
  y: number;
  rotation?: number;
}

export function LED({ color = '#EF4444', on = false, x, y, rotation = 0 }: LEDProps) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* Leads */}
      <line x1={-2} y1={18} x2={-2} y2={8} stroke="#888" strokeWidth={1.5} />
      <line x1={2} y1={18} x2={2} y2={6} stroke="#888" strokeWidth={1.5} />
      {/* Anode marker */}
      <text x={2} y={24} textAnchor="middle" fontSize={4} fill="#888">+</text>

      {/* LED body - flat bottom */}
      <ellipse cx={0} cy={2} rx={7} ry={6} fill={on ? color : '#666'} opacity={on ? 1 : 0.4} />
      <ellipse cx={0} cy={2} rx={7} ry={6} fill="none" stroke={on ? color : '#555'} strokeWidth={0.8} />

      {/* Lens dome */}
      <ellipse cx={0} cy={-2} rx={5.5} ry={5} fill={on ? color : '#888'} opacity={on ? 0.9 : 0.3} />

      {/* Highlight reflection */}
      <ellipse cx={-2} cy={-3} rx={2} ry={1.5} fill="white" opacity={on ? 0.5 : 0.2} />

      {/* Glow effect when on */}
      {on && (
        <>
          <ellipse cx={0} cy={0} rx={12} ry={10} fill={color} opacity={0.15} />
          <ellipse cx={0} cy={0} rx={18} ry={16} fill={color} opacity={0.06} />
        </>
      )}

      {/* Flat edge indicator (cathode) */}
      <line x1={6} y1={-1} x2={6} y2={5} stroke={on ? '#FFF' : '#AAA'} strokeWidth={0.5} opacity={0.5} />
    </g>
  );
}
