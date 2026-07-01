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

  const lines = text ? text.split('\n').slice(0, 3) : ['Hello', 'World'];

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <defs>
        <linearGradient id="oled-pcb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        <linearGradient id="oled-screen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <filter id="oled-bezel">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
        </filter>
      </defs>

      <line x1={-9} y1={19} x2={-9} y2={10} stroke="#B8B8B8" strokeWidth={1.2} strokeLinecap="round" />
      <line x1={-3} y1={19} x2={-3} y2={10} stroke="#B8B8B8" strokeWidth={1.2} strokeLinecap="round" />
      <line x1={3} y1={19} x2={3} y2={10} stroke="#B8B8B8" strokeWidth={1.2} strokeLinecap="round" />
      <line x1={9} y1={19} x2={9} y2={10} stroke="#B8B8B8" strokeWidth={1.2} strokeLinecap="round" />

      <rect x={-pcbW / 2} y={-pcbH / 2} width={pcbW} height={pcbH} rx={3} fill="url(#oled-pcb)" stroke="#1D4ED8" strokeWidth={1.5} />

      <rect x={-pcbW / 2 + 1} y={-pcbH / 2 + 1} width={pcbW - 2} height={pcbH - 2} rx={2} fill="#1E3A8A" opacity={0.3} />

      <rect x={-pcbW / 2 + 3} y={-pcbH / 2 + 3} width={6} height={3} rx={0.5} fill="#0A0A0A" />
      <rect x={-pcbW / 2 + 3} y={pcbH / 2 - 6} width={4} height={2} rx={0.3} fill="#0A0A0A" />

      <rect x={-screenW / 2 - 3} y={-screenH / 2 - 6} width={screenW + 6} height={screenH + 8} rx={2} fill="#1F2937" stroke="#374151" strokeWidth={1} filter="url(#oled-bezel)" />

      <rect x={-screenW / 2 - 2} y={-screenH / 2 - 5} width={screenW + 4} height={screenH + 6} rx={1.5} fill="url(#oled-screen)" />

      <rect x={-screenW / 2} y={-screenH / 2 - 3} width={screenW} height={screenH} rx={0.5} fill="#020617" />

      <rect x={-screenW / 2 + 2} y={-screenH / 2 - 1} width={screenW - 4} height={screenH - 2} fill="#38BDF8" opacity={0.05} />

      <g>
        {lines.map((line, i) => (
          <text
            key={i}
            x={-screenW / 2 + 3}
            y={-screenH / 2 + 3 + i * 5.5}
            fontSize={4}
            fill="#38BDF8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {line.length > 13 ? line.slice(0, 13) : line}
          </text>
        ))}
      </g>

      <rect x={-5} y={9} width={10} height={6} rx={0.5} fill="#111827" stroke="#374151" strokeWidth={0.5} />
      <rect x={-4} y={10} width={8} height={4} rx={0.3} fill="#0A0A0A" />
      <circle cx={-2.5} cy={12} r={0.6} fill="#374151" />
      <circle cx={2.5} cy={12} r={0.6} fill="#374151" />

      <text x={-9} y={16} fontSize={3.5} fill="#93C5FD" fontFamily="monospace" textAnchor="middle" fontWeight="bold">GND</text>
      <text x={-3} y={16} fontSize={3.5} fill="#93C5FD" fontFamily="monospace" textAnchor="middle" fontWeight="bold">VCC</text>
      <text x={3} y={16} fontSize={3.5} fill="#93C5FD" fontFamily="monospace" textAnchor="middle" fontWeight="bold">SCL</text>
      <text x={9} y={16} fontSize={3.5} fill="#93C5FD" fontFamily="monospace" textAnchor="middle" fontWeight="bold">SDA</text>

      <text x={0} y={pcbH / 2 - 2} textAnchor="middle" fontSize={3.5} fill="#60A5FA" fontFamily="monospace">SSD1306</text>
    </g>
  );
}
