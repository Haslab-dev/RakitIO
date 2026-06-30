
interface OLEDProps {
  text?: string;
  x: number;
  y: number;
  rotation?: number;
}

export function OLED({ text = '', x, y, rotation = 0 }: OLEDProps) {
  const pcbW = 36;
  const pcbH = 34;
  const screenW = 26;
  const screenH = 14;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* 4 pins (GND, VCC, SCL, SDA) */}
      <rect x={-12} y={pcbH / 2 + 2} width={3} height={8} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />
      <rect x={-4} y={pcbH / 2 + 2} width={3} height={8} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />
      <rect x={4} y={pcbH / 2 + 2} width={3} height={8} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />
      <rect x={12} y={pcbH / 2 + 2} width={3} height={8} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />

      {/* Pin labels */}
      <text x={-10.5} y={pcbH / 2 + 16} textAnchor="middle" fontSize={3.5} fill="#888">GND</text>
      <text x={-2.5} y={pcbH / 2 + 16} textAnchor="middle" fontSize={3.5} fill="#888">VCC</text>
      <text x={5.5} y={pcbH / 2 + 16} textAnchor="middle" fontSize={3.5} fill="#888">SCL</text>
      <text x={13.5} y={pcbH / 2 + 16} textAnchor="middle" fontSize={3.5} fill="#888">SDA</text>

      {/* PCB */}
      <rect
        x={-pcbW / 2}
        y={-pcbH / 2}
        width={pcbW}
        height={pcbH}
        rx={2}
        fill="#1A3A5C"
        stroke="#0E2A4A"
        strokeWidth={1}
      />

      {/* Screen bezel */}
      <rect
        x={-screenW / 2 - 1}
        y={-pcbH / 2 + 2}
        width={screenW + 2}
        height={screenH + 2}
        rx={1}
        fill="#111"
      />

      {/* Screen */}
      <rect
        x={-screenW / 2}
        y={-pcbH / 2 + 3}
        width={screenW}
        height={screenH}
        rx={0.5}
        fill="#0F2B5C"
      />

      {/* Screen content */}
      {text ? (
        <text
          x={0}
          y={-pcbH / 2 + 3 + screenH / 2 + 2}
          textAnchor="middle"
          fontSize={6}
          fill="#5B9BD5"
          fontFamily="monospace"
        >
          {text.length > 21 ? text.slice(0, 21) : text}
        </text>
      ) : (
        <>
          {/* Default display pattern */}
          {Array.from({ length: 4 }, (_, i) => (
            <line
              key={i}
              x1={-screenW / 2 + 3}
              y1={-pcbH / 2 + 5 + i * 3}
              x2={-screenW / 2 + 3 + (12 + i * 3)}
              y2={-pcbH / 2 + 5 + i * 3}
              stroke="#5B9BD5"
              strokeWidth={0.8}
              opacity={0.5}
            />
          ))}
        </>
      )}

      {/* SSD1306 chip */}
      <rect
        x={-6}
        y={pcbH / 2 - 10}
        width={12}
        height={8}
        rx={1}
        fill="#1A1A1A"
        stroke="#333"
        strokeWidth={0.5}
      />

      {/* Decoupling capacitor */}
      <rect x={pcbW / 2 - 6} y={-pcbH / 2 + 2} width={4} height={3} rx={0.5} fill="#8B7355" />

      {/* Label */}
      <text x={0} y={pcbH / 2 - 2} textAnchor="middle" fontSize={4} fill="#5B8AB5" fontFamily="monospace">
        0.96" OLED
      </text>
    </g>
  );
}
