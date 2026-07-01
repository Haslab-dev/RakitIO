interface HCSR04Props {
  distance?: number;
  x: number;
  y: number;
  rotation?: number;
}

export function HCSR04({ distance = 0, x, y, rotation = 0 }: HCSR04Props) {
  const bodyW = 48;
  const bodyH = 32;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <defs>
        <linearGradient id="hcsr04-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      <rect x={-bodyW/2} y={-bodyH/2} width={bodyW} height={bodyH} rx={3} fill="url(#hcsr04-body)" stroke="#334155" strokeWidth={1.5} />

      <rect x={-bodyW/2 + 2} y={-bodyH/2 + 2} width={bodyW - 4} height={8} rx={1} fill="#0F172A" />

      <circle cx={-10} cy={4} r={10} fill="#0F172A" stroke="#1E293B" strokeWidth={1} />
      <circle cx={-10} cy={4} r={7} fill="#1E293B" stroke="#334155" strokeWidth={0.5} />
      <circle cx={-10} cy={4} r={4} fill="#0F172A" />

      <circle cx={10} cy={4} r={10} fill="#0F172A" stroke="#1E293B" strokeWidth={1} />
      <circle cx={10} cy={4} r={7} fill="#1E293B" stroke="#334155" strokeWidth={0.5} />
      <circle cx={10} cy={4} r={4} fill="#0F172A" />

      <text x={0} y={-bodyH/2 - 4} fontSize={6} fill="#94A3B8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
        HC-SR04
      </text>

      <text x={0} y={bodyH/2 + 8} fontSize={5} fill="#22C55E" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
        {distance > 0 ? `${distance.toFixed(1)} cm` : '---'}
      </text>

      <line x1={-bodyW/2 - 8} y1={bodyH/2 + 6} x2={-bodyW/2 - 8} y2={bodyH/2 + 20} stroke="#C0C0C0" strokeWidth={1.5} />
      <line x1={-bodyW/2 - 4} y1={bodyH/2 + 6} x2={-bodyW/2 - 4} y2={bodyH/2 + 20} stroke="#C0C0C0" strokeWidth={1.5} />
      <line x1={bodyW/2 + 4} y1={bodyH/2 + 6} x2={bodyW/2 + 4} y2={bodyH/2 + 20} stroke="#C0C0C0" strokeWidth={1.5} />
      <line x1={bodyW/2 + 8} y1={bodyH/2 + 6} x2={bodyW/2 + 8} y2={bodyH/2 + 20} stroke="#C0C0C0" strokeWidth={1.5} />

      <rect x={-bodyW/2 - 10} y={bodyH/2 + 18} width={8} height={3} rx={1} fill="#6B7280" />
      <rect x={-bodyW/2 - 6} y={bodyH/2 + 18} width={4} height={3} rx={1} fill="#6B7280" />
      <rect x={bodyW/2 + 2} y={bodyH/2 + 18} width={8} height={3} rx={1} fill="#6B7280" />
      <rect x={bodyW/2 + 6} y={bodyH/2 + 18} width={4} height={3} rx={1} fill="#6B7280" />

      <text x={-bodyW/2 - 8} y={bodyH/2 + 28} fontSize={4.5} fill="#94A3B8" fontFamily="monospace" textAnchor="middle">VCC</text>
      <text x={-bodyW/2 - 4} y={bodyH/2 + 33} fontSize={4.5} fill="#94A3B8" fontFamily="monospace" textAnchor="middle">TRIG</text>
      <text x={bodyW/2 + 4} y={bodyH/2 + 28} fontSize={4.5} fill="#94A3B8" fontFamily="monospace" textAnchor="middle">ECHO</text>
      <text x={bodyW/2 + 8} y={bodyH/2 + 33} fontSize={4.5} fill="#94A3B8" fontFamily="monospace" textAnchor="middle">GND</text>

      <rect x={-bodyW/2 - 2} y={-bodyH/2 + 12} width={bodyW + 4} height={6} rx={1} fill="#1E293B" />
      <text x={0} y={-bodyH/2 + 17} fontSize={4} fill="#64748B" fontFamily="monospace" textAnchor="middle">ULTRASONIC</text>
    </g>
  );
}
