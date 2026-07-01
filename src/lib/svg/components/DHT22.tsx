interface DHT22Props {
  x: number;
  y: number;
  rotation?: number;
}

export function DHT22({ x, y, rotation = 0 }: DHT22Props) {
  const bodyW = 64;
  const bodyH = 80;
  const pinW = 4.5;
  const pinTop = 16;
  const pinBottom = 40;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <defs>
        <linearGradient id="dht-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="dht-sensor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <pattern id="dht-grid" patternUnits="userSpaceOnUse" width="6" height="4">
          <rect width="6" height="4" fill="#2563EB" />
          <rect x="0" y="1" width="6" height="2" fill="#1D4ED8" />
        </pattern>
      </defs>

      <line x1={-18} y1={pinBottom} x2={-18} y2={pinTop} stroke="#C0C0C0" strokeWidth={pinW} strokeLinecap="butt" />
      <line x1={0} y1={pinBottom} x2={0} y2={pinTop} stroke="#C0C0C0" strokeWidth={pinW} strokeLinecap="butt" />
      <line x1={18} y1={18} x2={18} y2={pinBottom} stroke="#C0C0C0" strokeWidth={pinW} strokeLinecap="butt" />

      <rect x={-18 - pinW / 2} y={pinTop - 2} width={pinW} height={4} rx={1} fill="#6B7280" />
      <rect x={0 - pinW / 2} y={pinTop - 2} width={pinW} height={4} rx={1} fill="#6B7280" />
      <rect x={18 - pinW / 2} y={pinTop - 2} width={pinW} height={4} rx={1} fill="#6B7280" />

      <rect x={-bodyW / 2} y={-bodyH / 2} width={bodyW} height={bodyH} rx={5} fill="url(#dht-body)" stroke="#1D4ED8" strokeWidth={2.5} />

      <rect x={-bodyW / 2} y={-bodyH / 2} width={bodyW} height={bodyH} rx={5} fill="url(#dht-grid)" opacity={0.5} />

      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x={-bodyW / 2 + 8}
          y={-bodyH / 2 + 10 + i * 7}
          width={bodyW - 16}
          height={3}
          rx={1}
          fill="#1D4ED8"
          opacity={0.6}
        />
      ))}

      <rect x={-bodyW / 2 + 4} y={bodyH / 2 - 26} width={bodyW - 8} height={16} rx={2.5} fill="#1D4ED8" />

      <circle cx={0} cy={-bodyH / 2 + 12} r={8} fill="url(#dht-sensor)" stroke="#1E40AF" strokeWidth={1} />
      <circle cx={0} cy={-bodyH / 2 + 12} r={5} fill="#0A1628" />
      <circle cx={0} cy={-bodyH / 2 + 12} r={2} fill="#1E3A8A" opacity={0.5} />

      <text x={0} y={bodyH / 2 - 14} textAnchor="middle" fontSize={9} fill="#FFFFFF" fontFamily="monospace" fontWeight="bold">DHT22</text>
      <text x={0} y={bodyH / 2 - 5} textAnchor="middle" fontSize={5} fill="#93C5FD" fontFamily="monospace">AM2302</text>

      <text x={-18} y={pinBottom + 8} fontSize={6.5} fill="#93C5FD" fontFamily="monospace" textAnchor="middle" fontWeight="bold">VCC</text>
      <text x={0} y={pinBottom + 8} fontSize={6.5} fill="#93C5FD" fontFamily="monospace" textAnchor="middle" fontWeight="bold">DATA</text>
      <text x={18} y={pinBottom + 8} fontSize={6.5} fill="#93C5FD" fontFamily="monospace" textAnchor="middle" fontWeight="bold">GND</text>
    </g>
  );
}
