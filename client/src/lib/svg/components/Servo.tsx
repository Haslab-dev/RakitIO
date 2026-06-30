
interface ServoProps {
  angle?: number;
  x: number;
  y: number;
  rotation?: number;
}

export function Servo({ angle = 90, x, y, rotation = 0 }: ServoProps) {
  const clampedAngle = Math.max(0, Math.min(180, angle));
  const hornAngle = -90 + clampedAngle;
  const bodyW = 52;
  const bodyH = 42;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* Wires */}
      <line x1={-bodyW / 2 - 5} y1={8} x2={-bodyW / 2 - 25} y2={8} stroke="#8B4513" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={-bodyW / 2 - 5} y1={0} x2={-bodyW / 2 - 25} y2={0} stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={-bodyW / 2 - 5} y1={-8} x2={-bodyW / 2 - 25} y2={-8} stroke="#F97316" strokeWidth={2.5} strokeLinecap="round" />

      {/* Wire labels */}
      <text x={-bodyW / 2 - 28} y={-6} textAnchor="end" fontSize={4} fill="#888">SIG</text>
      <text x={-bodyW / 2 - 28} y={2} textAnchor="end" fontSize={4} fill="#888">VCC</text>
      <text x={-bodyW / 2 - 28} y={10} textAnchor="end" fontSize={4} fill="#888">GND</text>

      {/* Mounting tab - left */}
      <rect x={-bodyW / 2 - 8} y={-bodyH / 2 + 4} width={10} height={8} rx={1} fill="#3A3A5A" stroke="#2A2A4A" strokeWidth={0.8} />
      <circle cx={-bodyW / 2 - 3} cy={-bodyH / 2 + 8} r={1.5} fill="#222" />

      {/* Mounting tab - right */}
      <rect x={bodyW / 2 - 2} y={-bodyH / 2 + 4} width={10} height={8} rx={1} fill="#3A3A5A" stroke="#2A2A4A" strokeWidth={0.8} />
      <circle cx={bodyW / 2 + 3} cy={-bodyH / 2 + 8} r={1.5} fill="#222" />

      {/* Servo body */}
      <rect
        x={-bodyW / 2}
        y={-bodyH / 2}
        width={bodyW}
        height={bodyH}
        rx={3}
        fill="#4A4A6A"
        stroke="#3A3A5A"
        strokeWidth={1.5}
      />

      {/* Top section (darker) */}
      <rect
        x={-bodyW / 2}
        y={-bodyH / 2}
        width={bodyW}
        height={bodyH * 0.4}
        rx={3}
        fill="#3A3A5A"
      />

      {/* Bottom section (lighter) */}
      <rect
        x={-bodyW / 2 + 2}
        y={-bodyH / 2 + bodyH * 0.4}
        width={bodyW - 4}
        height={bodyH * 0.6 - 2}
        rx={1}
        fill="#5A5A7A"
        opacity={0.5}
      />

      {/* Label */}
      <text x={0} y={8} textAnchor="middle" fontSize={7} fill="#B0B0CC" fontFamily="monospace" fontWeight="bold">
        SG90
      </text>
      <text x={0} y={16} textAnchor="middle" fontSize={5} fill="#808099" fontFamily="monospace">
        SERVO
      </text>

      {/* Horn mounting circle */}
      <circle cx={0} cy={-bodyH / 2 - 6} r={10} fill="#555" stroke="#444" strokeWidth={1} />

      {/* Horn shaft */}
      <circle cx={0} cy={-bodyH / 2 - 6} r={3} fill="#888" stroke="#777" strokeWidth={0.5} />

      {/* Horn arm */}
      <line
        x1={0}
        y1={-bodyH / 2 - 6}
        x2={18 * Math.cos((hornAngle * Math.PI) / 180)}
        y2={-bodyH / 2 - 6 + 18 * Math.sin((hornAngle * Math.PI) / 180)}
        stroke="#AAA"
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* Horn tip */}
      <circle
        cx={18 * Math.cos((hornAngle * Math.PI) / 180)}
        cy={-bodyH / 2 - 6 + 18 * Math.sin((hornAngle * Math.PI) / 180)}
        r={2}
        fill="#CCC"
      />

      {/* Angle label */}
      <text x={0} y={bodyH / 2 + 14} textAnchor="middle" fontSize={6} fill="#888" fontFamily="monospace">
        {clampedAngle}°
      </text>
    </g>
  );
}
