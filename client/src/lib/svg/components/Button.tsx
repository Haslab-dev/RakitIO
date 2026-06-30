
interface ButtonProps {
  pressed?: boolean;
  x: number;
  y: number;
  rotation?: number;
}

export function Button({ pressed = false, x, y, rotation = 0 }: ButtonProps) {
  const bodyW = 24;
  const bodyH = 24;
  const capOffset = pressed ? 1 : 0;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* 4 pins */}
      <rect x={-16} y={-8} width={6} height={4} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />
      <rect x={10} y={-8} width={6} height={4} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />
      <rect x={-16} y={4} width={6} height={4} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />
      <rect x={10} y={4} width={6} height={4} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />

      {/* Pin leads */}
      <line x1={-13} y1={-4} x2={-8} y2={-4} stroke="#999" strokeWidth={1} />
      <line x1={13} y1={-4} x2={8} y2={-4} stroke="#999" strokeWidth={1} />
      <line x1={-13} y1={8} x2={-8} y2={8} stroke="#999" strokeWidth={1} />
      <line x1={13} y1={8} x2={8} y2={8} stroke="#999" strokeWidth={1} />

      {/* Button body */}
      <rect
        x={-bodyW / 2}
        y={-bodyH / 2}
        width={bodyW}
        height={bodyH}
        rx={2}
        fill="#444"
        stroke="#333"
        strokeWidth={1}
      />

      {/* Internal contacts */}
      <circle cx={-4} cy={-3} r={2} fill="#C0C0C0" opacity={0.4} />
      <circle cx={4} cy={-3} r={2} fill="#C0C0C0" opacity={0.4} />
      <circle cx={-4} cy={3} r={2} fill="#C0C0C0" opacity={0.4} />
      <circle cx={4} cy={3} r={2} fill="#C0C0C0" opacity={0.4} />

      {/* Button cap */}
      <rect
        x={-bodyW / 2 + 2}
        y={-bodyH / 2 + 2 + capOffset}
        width={bodyW - 4}
        height={bodyH - 4}
        rx={3}
        fill={pressed ? '#888' : '#666'}
        stroke="#555"
        strokeWidth={0.5}
      />

      {/* Cap highlight */}
      <rect
        x={-bodyW / 2 + 4}
        y={-bodyH / 2 + 3 + capOffset}
        width={bodyW - 8}
        height={4}
        rx={1}
        fill="white"
        opacity={pressed ? 0.1 : 0.15}
      />

      {/* Click indicator when pressed */}
      {pressed && (
        <text x={0} y={1} textAnchor="middle" fontSize={6} fill="#FFF" opacity={0.5}>●</text>
      )}
    </g>
  );
}
