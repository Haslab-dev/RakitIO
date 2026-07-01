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
      <defs>
        <linearGradient id="bme-pcb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3D2A6B" />
          <stop offset="50%" stopColor="#2D1A4E" />
          <stop offset="100%" stopColor="#1E0E3E" />
        </linearGradient>
        <pattern id="bme-copper" patternUnits="userSpaceOnUse" width="4" height="4">
          <rect width="4" height="4" fill="#2D1A4E" />
          <circle cx="2" cy="2" r="0.5" fill="#C9A227" opacity="0.3" />
        </pattern>
        <linearGradient id="bme-metal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4D4D4" />
          <stop offset="30%" stopColor="#A8A8A8" />
          <stop offset="70%" stopColor="#909090" />
          <stop offset="100%" stopColor="#707070" />
        </linearGradient>
      </defs>

      <rect x={-15 - pinW / 2} y={pinTop} width={pinW} height={pinBottom - pinTop} rx={0.8} fill="#C0C0C0" stroke="#999999" strokeWidth={0.4} />
      <rect x={-5 - pinW / 2} y={pinTop} width={pinW} height={pinBottom - pinTop} rx={0.8} fill="#C0C0C0" stroke="#999999" strokeWidth={0.4} />
      <rect x={5 - pinW / 2} y={pinTop} width={pinW} height={pinBottom - pinTop} rx={0.8} fill="#C0C0C0" stroke="#999999" strokeWidth={0.4} />
      <rect x={15 - pinW / 2} y={pinTop} width={pinW} height={pinBottom - pinTop} rx={0.8} fill="#C0C0C0" stroke="#999999" strokeWidth={0.4} />

      <rect x={-15 - pinW / 2 - 0.5} y={pinTop - 2} width={pinW + 1} height={4} rx={0.6} fill="#6B7280" />
      <rect x={-5 - pinW / 2 - 0.5} y={pinTop - 2} width={pinW + 1} height={4} rx={0.6} fill="#6B7280" />
      <rect x={5 - pinW / 2 - 0.5} y={pinTop - 2} width={pinW + 1} height={4} rx={0.6} fill="#6B7280" />
      <rect x={15 - pinW / 2 - 0.5} y={pinTop - 2} width={pinW + 1} height={4} rx={0.6} fill="#6B7280" />

      <text x={-15} y={pinBottom + 7} textAnchor="middle" fontSize={4.5} fill="#B8A9D9" fontFamily="monospace" fontWeight="bold">VCC</text>
      <text x={-5} y={pinBottom + 7} textAnchor="middle" fontSize={4.5} fill="#B8A9D9" fontFamily="monospace" fontWeight="bold">GND</text>
      <text x={5} y={pinBottom + 7} textAnchor="middle" fontSize={4.5} fill="#B8A9D9" fontFamily="monospace" fontWeight="bold">SCL</text>
      <text x={15} y={pinBottom + 7} textAnchor="middle" fontSize={4.5} fill="#B8A9D9" fontFamily="monospace" fontWeight="bold">SDA</text>

      <rect x={-pcbW / 2} y={-pcbH / 2} width={pcbW} height={pcbH} rx={2.5} fill="url(#bme-pcb)" stroke="#1E0E3E" strokeWidth={1} />
      <rect x={-pcbW / 2 + 1} y={-pcbH / 2 + 1} width={pcbW - 2} height={pcbH - 2} rx={2} fill="url(#bme-copper)" />

      <rect x={-11} y={-5} width={14} height={14} rx={0.8} fill="#1A1A1A" stroke="#333333" strokeWidth={0.6} />
      <rect x={-9} y={-3} width={10} height={10} rx={0.5} fill="#0A0A0A" />
      <line x1={-6} y1={-1} x2={2} y2={-1} stroke="#444444" strokeWidth={0.3} />
      <line x1={-6} y1={1} x2={2} y2={1} stroke="#444444" strokeWidth={0.3} />
      <line x1={-6} y1={3} x2={2} y2={3} stroke="#444444" strokeWidth={0.3} />
      <text x={-1} y={6} textAnchor="middle" fontSize={4} fill="#666666" fontFamily="monospace" fontWeight="bold">BME</text>

      <rect x={11} y={-5} width={5} height={4} rx={0.5} fill="#a07c54" />
      <rect x={11} y={1} width={5} height={3} rx={0.4} fill="#a07c54" />

      <rect x={-pcbW / 2 + 2.5} y={-pcbH / 2 + 2.5} width={4} height={2.5} rx={0.4} fill="#a07c54" />
      <rect x={-pcbW / 2 + 2.5} y={-pcbH / 2 + 7} width={4} height={2.5} rx={0.4} fill="#a07c54" />

      <circle cx={0} cy={-pcbH / 2 + 5} r={2.5} fill="#0A0A0A" stroke="#3D2A6B" strokeWidth={0.5} />
      <circle cx={0} cy={-pcbH / 2 + 5} r={1} fill="#1E0E3E" />

      <circle cx={pcbW / 2 - 3} cy={-pcbH / 2 + 3} r={1.6} fill="#0A0A0A" stroke="#C9A227" strokeWidth={0.4} />
      <circle cx={-pcbW / 2 + 3} cy={pcbH / 2 - 3} r={1.6} fill="#0A0A0A" stroke="#C9A227" strokeWidth={0.4} />

      <text x={0} y={pcbH / 2 - 4} textAnchor="middle" fontSize={5} fill="#8B6EAE" fontFamily="monospace" fontWeight="bold">BME280</text>

      <text x={-pcbW / 2 + 4} y={-pcbH / 2 + pcbH - 4} fontSize={3} fill="#6B5A8E" fontFamily="monospace">ADDR</text>
    </g>
  );
}
