interface DHT22Props {
  x: number;
  y: number;
  rotation?: number;
}

export function DHT22({ x, y, rotation = 0 }: DHT22Props) {
  const bodyW = 64;
  const bodyH = 80;
  const pinW = 4.5;
  const pinTop = 16; // where pins enter the body (y)
  const pinBottom = 40; // pin tip (y)

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* 3 Metal Lead Pins (wider) */}
      <line x1={-18} y1={pinBottom} x2={-18} y2={pinTop} stroke="#9CA3AF" strokeWidth={pinW} strokeLinecap="round" />
      <line x1={0} y1={pinBottom} x2={0} y2={pinTop} stroke="#9CA3AF" strokeWidth={pinW} strokeLinecap="round" />
      <line x1={18} y1={18} x2={18} y2={pinBottom} stroke="#9CA3AF" strokeWidth={pinW} strokeLinecap="round" />

      {/* Pin solder pads on the body */}
      <rect x={-18 - pinW / 2} y={pinTop - 2} width={pinW} height={4} rx={1} fill="#6B7280" />
      <rect x={0 - pinW / 2} y={pinTop - 2} width={pinW} height={4} rx={1} fill="#6B7280" />
      <rect x={18 - pinW / 2} y={pinTop - 2} width={pinW} height={4} rx={1} fill="#6B7280" />

      {/* DHT Body (Flat Blue/Cyan Grid Casing) */}
      <rect
        x={-bodyW / 2}
        y={-bodyH / 2}
        width={bodyW}
        height={bodyH}
        rx={5}
        fill="#3B82F6"
        stroke="#1D4ED8"
        strokeWidth={2.5}
      />

      {/* Horizontal Ventilation Grille Slots */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect
          key={i}
          x={-bodyW / 2 + 7}
          y={-bodyH / 2 + 7 + i * 8}
          width={bodyW - 14}
          height={3.5}
          rx={1}
          fill="#1D4ED8"
          opacity={0.75}
        />
      ))}

      {/* Label Panel */}
      <rect
        x={-bodyW / 2 + 4}
        y={bodyH / 2 - 26}
        width={bodyW - 8}
        height={16}
        rx={2.5}
        fill="#1D4ED8"
      />
      <text x={0} y={bodyH / 2 - 14} textAnchor="middle" fontSize={9} fill="#FFFFFF" fontFamily="monospace" fontWeight="bold">
        DHT22
      </text>

      {/* Sensor mesh dot */}
      <circle cx={0} cy={-bodyH / 2 + 12} r={3} fill="#1E40AF" opacity={0.6} />

      {/* Pin Labels */}
      <text x={-18} y={pinBottom + 8} fontSize={6.5} fill="#93C5FD" fontFamily="monospace" textAnchor="middle" fontWeight="bold">V</text>
      <text x={0} y={pinBottom + 8} fontSize={6.5} fill="#93C5FD" fontFamily="monospace" textAnchor="middle" fontWeight="bold">D</text>
      <text x={18} y={pinBottom + 8} fontSize={6.5} fill="#93C5FD" fontFamily="monospace" textAnchor="middle" fontWeight="bold">G</text>
    </g>
  );
}
