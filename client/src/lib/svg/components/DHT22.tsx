
interface DHT22Props {
  x: number;
  y: number;
  rotation?: number;
}

export function DHT22({ x, y, rotation = 0 }: DHT22Props) {
  const bodyW = 28;
  const bodyH = 36;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* 3 pins (VCC, DATA, GND) */}
      <rect x={-6} y={bodyH / 2 + 2} width={3} height={10} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />
      <rect x={0} y={bodyH / 2 + 2} width={3} height={10} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />
      <rect x={6} y={bodyH / 2 + 2} width={3} height={10} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />

      {/* Pin labels */}
      <text x={-4.5} y={bodyH / 2 + 18} textAnchor="middle" fontSize={3.5} fill="#888">VCC</text>
      <text x={1.5} y={bodyH / 2 + 18} textAnchor="middle" fontSize={3.5} fill="#888">DAT</text>
      <text x={7.5} y={bodyH / 2 + 18} textAnchor="middle" fontSize={3.5} fill="#888">GND</text>

      {/* Body */}
      <rect
        x={-bodyW / 2}
        y={-bodyH / 2}
        width={bodyW}
        height={bodyH}
        rx={2}
        fill="#F0F0F0"
        stroke="#D0D0D0"
        strokeWidth={1}
      />

      {/* Ventilated front grille */}
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x={-bodyW / 2 + 4}
          y={-bodyH / 2 + 4 + i * 3.5}
          width={bodyW - 8}
          height={2}
          rx={0.5}
          fill="#D0D0D0"
          opacity={0.6}
        />
      ))}

      {/* Brand area */}
      <rect
        x={-bodyW / 2 + 2}
        y={bodyH / 2 - 12}
        width={bodyW - 4}
        height={10}
        rx={1}
        fill="#E8E8E8"
      />

      {/* Label */}
      <text x={0} y={bodyH / 2 - 5} textAnchor="middle" fontSize={5} fill="#666" fontFamily="monospace" fontWeight="bold">
        DHT22
      </text>
      <text x={0} y={bodyH / 2 + 1} textAnchor="middle" fontSize={3.5} fill="#999" fontFamily="monospace">
        AM2302
      </text>

      {/* Humidity icon hint */}
      <text x={0} y={-bodyH / 2 - 4} textAnchor="middle" fontSize={5} fill="#888" fontFamily="monospace">
        T/H
      </text>
    </g>
  );
}
