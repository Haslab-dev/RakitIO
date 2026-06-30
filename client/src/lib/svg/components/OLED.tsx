interface OLEDProps {
  text?: string;
  x: number;
  y: number;
  rotation?: number;
}

export function OLED({ text = '', x, y, rotation = 0 }: OLEDProps) {
  const pcbW = 38;
  const pcbH = 38;
  const screenW = 32;
  const screenH = 18;

  // Split text into lines if there's any
  const lines = text ? text.split('\n').slice(0, 3) : ['Hello', 'World'];

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* 4 Metal Lead Pins */}
      <line x1={-9} y1={19} x2={-9} y2={10} stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" />
      <line x1={-3} y1={19} x2={-3} y2={10} stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" />
      <line x1={3} y1={19} x2={3} y2={10} stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" />
      <line x1={9} y1={19} x2={9} y2={10} stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" />

      {/* PCB Base (Flat Blue Board) */}
      <rect
        x={-pcbW / 2}
        y={-pcbH / 2}
        width={pcbW}
        height={pcbH}
        rx={3}
        fill="#1E3A8A"
        stroke="#1D4ED8"
        strokeWidth={1.5}
      />

      {/* Screen Frame */}
      <rect
        x={-screenW / 2}
        y={-screenH / 2 - 4}
        width={screenW}
        height={screenH}
        rx={1.5}
        fill="#030712"
        stroke="#374151"
        strokeWidth={1}
      />

      {/* OLED Text (Cyan / Blue-ish pixels) */}
      <g>
        {lines.map((line, i) => (
          <text
            key={i}
            x={-screenW / 2 + 3}
            y={-screenH / 2 + 2 + i * 5}
            fontSize={4.5}
            fill="#38BDF8"
            fontFamily="monospace"
            fontWeight="bold"
            dominantBaseline="middle"
          >
            {line.length > 12 ? line.slice(0, 12) : line}
          </text>
        ))}
      </g>

      {/* Mini SSD1306 IC (Flat black rect) */}
      <rect x={-5} y={8} width={10} height={6} rx={0.5} fill="#111827" stroke="#374151" strokeWidth={0.5} />
      <circle cx={-3} cy={10} r={0.5} fill="#374151" />

      {/* Pin labels on PCB */}
      <text x={-9} y={16} fontSize={3.5} fill="#93C5FD" fontFamily="monospace" textAnchor="middle" fontWeight="bold">G</text>
      <text x={-3} y={16} fontSize={3.5} fill="#93C5FD" fontFamily="monospace" textAnchor="middle" fontWeight="bold">V</text>
      <text x={3} y={16} fontSize={3.5} fill="#93C5FD" fontFamily="monospace" textAnchor="middle" fontWeight="bold">CL</text>
      <text x={9} y={16} fontSize={3.5} fill="#93C5FD" fontFamily="monospace" textAnchor="middle" fontWeight="bold">DA</text>
    </g>
  );
}
