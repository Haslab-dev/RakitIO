
interface PotentiometerProps {
  position?: number;
  x: number;
  y: number;
  rotation?: number;
}

export function Potentiometer({ position = 0.5, x, y, rotation = 0 }: PotentiometerProps) {
  const clampedPos = Math.max(0, Math.min(1, position));
  const angle = -135 + clampedPos * 270;
  const bodyR = 20;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* 3 pins */}
      <rect x={-10} y={bodyR + 4} width={4} height={8} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />
      <rect x={-2} y={bodyR + 4} width={4} height={8} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />
      <rect x={6} y={bodyR + 4} width={4} height={8} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />

      {/* Pin labels */}
      <text x={-8} y={bodyR + 20} textAnchor="middle" fontSize={4} fill="#888">1</text>
      <text x={0} y={bodyR + 20} textAnchor="middle" fontSize={4} fill="#888">W</text>
      <text x={8} y={bodyR + 20} textAnchor="middle" fontSize={4} fill="#888">2</text>

      {/* Body base */}
      <circle cx={0} cy={0} r={bodyR + 2} fill="#555" stroke="#444" strokeWidth={1} />

      {/* Body */}
      <circle cx={0} cy={0} r={bodyR} fill="#3A3A3A" stroke="#333" strokeWidth={1} />

      {/* Resistance track arc */}
      <path
        d={`M ${bodyR * 0.6 * Math.cos((-135 * Math.PI) / 180)} ${bodyR * 0.6 * Math.sin((-135 * Math.PI) / 180)} A ${bodyR * 0.6} ${bodyR * 0.6} 0 1 1 ${bodyR * 0.6 * Math.cos((135 * Math.PI) / 180)} ${bodyR * 0.6 * Math.sin((135 * Math.PI) / 180)}`}
        fill="none"
        stroke="#666"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Knurled knob edge */}
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i * 15 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={(bodyR - 1) * Math.cos(a)}
            y1={(bodyR - 1) * Math.sin(a)}
            x2={(bodyR + 1) * Math.cos(a)}
            y2={(bodyR + 1) * Math.sin(a)}
            stroke="#555"
            strokeWidth={0.8}
          />
        );
      })}

      {/* Center shaft */}
      <circle cx={0} cy={0} r={4} fill="#666" stroke="#555" strokeWidth={0.5} />

      {/* Position indicator (pointer) */}
      <line
        x1={0}
        y1={0}
        x2={bodyR * 0.7 * Math.cos((angle * Math.PI) / 180)}
        y2={bodyR * 0.7 * Math.sin((angle * Math.PI) / 180)}
        stroke="#E5E7EB"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Position dot */}
      <circle
        cx={bodyR * 0.7 * Math.cos((angle * Math.PI) / 180)}
        cy={bodyR * 0.7 * Math.sin((angle * Math.PI) / 180)}
        r={2}
        fill="#E5E7EB"
      />

      {/* Label */}
      <text x={0} y={-bodyR - 6} textAnchor="middle" fontSize={5} fill="#888" fontFamily="monospace">
        POT
      </text>
    </g>
  );
}
