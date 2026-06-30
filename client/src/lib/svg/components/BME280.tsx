
interface BME280Props {
  x: number;
  y: number;
  rotation?: number;
}

export function BME280({ x, y, rotation = 0 }: BME280Props) {
  const pcbW = 26;
  const pcbH = 18;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* 4 pins (VCC, GND, SCL, SDA) */}
      <rect x={-10} y={pcbH / 2 + 2} width={3} height={8} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />
      <rect x={-3.5} y={pcbH / 2 + 2} width={3} height={8} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />
      <rect x={3} y={pcbH / 2 + 2} width={3} height={8} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />
      <rect x={9.5} y={pcbH / 2 + 2} width={3} height={8} rx={0.5} fill="#C0C0C0" stroke="#999" strokeWidth={0.3} />

      {/* Pin labels */}
      <text x={-8.5} y={pcbH / 2 + 16} textAnchor="middle" fontSize={3} fill="#888">VCC</text>
      <text x={-2} y={pcbH / 2 + 16} textAnchor="middle" fontSize={3} fill="#888">GND</text>
      <text x={4.5} y={pcbH / 2 + 16} textAnchor="middle" fontSize={3} fill="#888">SCL</text>
      <text x={11} y={pcbH / 2 + 16} textAnchor="middle" fontSize={3} fill="#888">SDA</text>

      {/* PCB */}
      <rect
        x={-pcbW / 2}
        y={-pcbH / 2}
        width={pcbW}
        height={pcbH}
        rx={2}
        fill="#2D1A4E"
        stroke="#1E0E3E"
        strokeWidth={0.8}
      />

      {/* BME280 chip */}
      <rect
        x={-5}
        y={-5}
        width={10}
        height={10}
        rx={0.5}
        fill="#1A1A1A"
        stroke="#333"
        strokeWidth={0.5}
      />

      {/* Chip markings */}
      <line x1={-3} y1={-3.5} x2={3} y2={-3.5} stroke="#444" strokeWidth={0.3} />
      <line x1={-3} y1={-1.5} x2={3} y2={-1.5} stroke="#444" strokeWidth={0.3} />
      <text x={0} y={2} textAnchor="middle" fontSize={2.5} fill="#555" fontFamily="monospace">BME</text>

      {/* Decoupling capacitor */}
      <rect x={8} y={-4} width={4} height={3} rx={0.3} fill="#8B7355" />

      {/* I2C address pull-up resistors */}
      <rect x={-pcbW / 2 + 2} y={-pcbH / 2 + 2} width={3} height={2} rx={0.3} fill="#8B7355" />
      <rect x={-pcbW / 2 + 2} y={-pcbH / 2 + 6} width={3} height={2} rx={0.3} fill="#8B7355" />

      {/* Sensor hole */}
      <circle cx={0} cy={-pcbH / 2 + 4} r={1.5} fill="#1E0E3E" />

      {/* Label */}
      <text x={0} y={pcbH / 2 - 3} textAnchor="middle" fontSize={3.5} fill="#8B6EAE" fontFamily="monospace" fontWeight="bold">
        BME280
      </text>
    </g>
  );
}
