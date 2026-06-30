
interface BME280Props {
  x: number;
  y: number;
  rotation?: number;
}

export function BME280({ x, y, rotation = 0 }: BME280Props) {
  const pcbW = 42;
  const pcbH = 30;
  const pinW = 4;
  const pinTop = pcbH / 2 + 2;
  const pinBottom = pcbH / 2 + 12;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* 4 wider metal pins (VCC, GND, SCL, SDA) */}
      <rect x={-15 - pinW / 2} y={pinTop} width={pinW} height={pinBottom - pinTop} rx={0.8} fill="#C0C0C0" stroke="#999999" strokeWidth={0.4} />
      <rect x={-5 - pinW / 2} y={pinTop} width={pinW} height={pinBottom - pinTop} rx={0.8} fill="#C0C0C0" stroke="#999999" strokeWidth={0.4} />
      <rect x={5 - pinW / 2} y={pinTop} width={pinW} height={pinBottom - pinTop} rx={0.8} fill="#C0C0C0" stroke="#999999" strokeWidth={0.4} />
      <rect x={15 - pinW / 2} y={pinTop} width={pinW} height={pinBottom - pinTop} rx={0.8} fill="#C0C0C0" stroke="#999999" strokeWidth={0.4} />

      {/* Pin solder pads on PCB */}
      <rect x={-15 - pinW / 2 - 0.5} y={pinTop - 2} width={pinW + 1} height={4} rx={0.6} fill="#6B7280" />
      <rect x={-5 - pinW / 2 - 0.5} y={pinTop - 2} width={pinW + 1} height={4} rx={0.6} fill="#6B7280" />
      <rect x={5 - pinW / 2 - 0.5} y={pinTop - 2} width={pinW + 1} height={4} rx={0.6} fill="#6B7280" />
      <rect x={15 - pinW / 2 - 0.5} y={pinTop - 2} width={pinW + 1} height={4} rx={0.6} fill="#6B7280" />

      {/* Pin labels */}
      <text x={-15} y={pinBottom + 7} textAnchor="middle" fontSize={4.5} fill="#B8A9D9" fontFamily="monospace" fontWeight="bold">VCC</text>
      <text x={-5} y={pinBottom + 7} textAnchor="middle" fontSize={4.5} fill="#B8A9D9" fontFamily="monospace" fontWeight="bold">GND</text>
      <text x={5} y={pinBottom + 7} textAnchor="middle" fontSize={4.5} fill="#B8A9D9" fontFamily="monospace" fontWeight="bold">SCL</text>
      <text x={15} y={pinBottom + 7} textAnchor="middle" fontSize={4.5} fill="#B8A9D9" fontFamily="monospace" fontWeight="bold">SDA</text>

      {/* PCB */}
      <rect
        x={-pcbW / 2}
        y={-pcbH / 2}
        width={pcbW}
        height={pcbH}
        rx={2.5}
        fill="#2D1A4E"
        stroke="#1E0E3E"
        strokeWidth={1}
      />

      {/* BME280 chip */}
      <rect x={-7} y={-7} width={14} height={14} rx={0.8} fill="#1A1A1A" stroke="#333333" strokeWidth={0.6} />

      {/* Chip markings */}
      <line x1={-4.5} y1={-4} x2={4.5} y2={-4} stroke="#444444" strokeWidth={0.4} />
      <line x1={-4.5} y1={-1.5} x2={4.5} y2={-1.5} stroke="#444444" strokeWidth={0.4} />
      <text x={0} y={3} textAnchor="middle" fontSize={4} fill="#666666" fontFamily="monospace" fontWeight="bold">BME</text>

      {/* Decoupling capacitor */}
      <rect x={11} y={-5} width={5} height={4} rx={0.5} fill="#a07c54" />

      {/* I2C address pull-up resistors */}
      <rect x={-pcbW / 2 + 2.5} y={-pcbH / 2 + 2.5} width={4} height={2.5} rx={0.4} fill="#a07c54" />
      <rect x={-pcbW / 2 + 2.5} y={-pcbH / 2 + 7} width={4} height={2.5} rx={0.4} fill="#a07c54" />

      {/* Sensor breathing hole */}
      <circle cx={0} cy={-pcbH / 2 + 5} r={2} fill="#1E0E3E" />

      {/* Mount holes */}
      <circle cx={pcbW / 2 - 3} cy={-pcbH / 2 + 3} r={1.6} fill="#1E0E3E" stroke="#4B5563" strokeWidth={0.4} />
      <circle cx={-pcbW / 2 + 3} cy={pcbH / 2 - 3} r={1.6} fill="#1E0E3E" stroke="#4B5563" strokeWidth={0.4} />

      {/* Label */}
      <text x={0} y={pcbH / 2 - 4} textAnchor="middle" fontSize={5} fill="#8B6EAE" fontFamily="monospace" fontWeight="bold">
        BME280
      </text>
    </g>
  );
}
