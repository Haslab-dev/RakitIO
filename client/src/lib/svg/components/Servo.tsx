interface ServoProps {
  angle?: number;
  x: number;
  y: number;
  rotation?: number;
}

export function Servo({ angle = 90, x, y, rotation = 0 }: ServoProps) {
  const clampedAngle = Math.max(0, Math.min(180, angle));
  const hornAngle = -90 + clampedAngle;
  const bodyW = 60;
  const bodyH = 48;
  const pivotY = 0; // Center the horn rotation at y = 0

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* 3 Flat Connecting Wires (Orange, Red, Brown) - Extending to -68 */}
      <line x1={-bodyW / 2} y1={-13} x2={-68} y2={-13} stroke="#F59E0B" strokeWidth={3.5} strokeLinecap="round" />
      <line x1={-bodyW / 2} y1={0} x2={-68} y2={0} stroke="#EF4444" strokeWidth={3.5} strokeLinecap="round" />
      <line x1={-bodyW / 2} y1={13} x2={-68} y2={13} stroke="#78350F" strokeWidth={3.5} strokeLinecap="round" />

      {/* Wire Labels */}
      <text x={-40} y={-9} fontSize={5.5} fill="#F59E0B" fontFamily="monospace" fontWeight="bold">SIG</text>
      <text x={-40} y={4} fontSize={5.5} fill="#EF4444" fontFamily="monospace" fontWeight="bold">VCC</text>
      <text x={-40} y={17} fontSize={5.5} fill="#78350F" fontFamily="monospace" fontWeight="bold">GND</text>

      {/* Servo Body (Flat Blue Box) */}
      <rect
        x={-bodyW / 2}
        y={-bodyH / 2}
        width={bodyW}
        height={bodyH}
        rx={4}
        fill="#2563EB"
        stroke="#1D4ED8"
        strokeWidth={2}
      />
      {/* Top Cap Accent */}
      <rect
        x={-bodyW / 2 + 2}
        y={-bodyH / 2 + 2}
        width={bodyW - 4}
        height={8}
        rx={2}
        fill="#1D4ED8"
      />

      {/* Text Labels */}
      <text x={12} y={1} textAnchor="middle" fontSize={8} fill="#FFFFFF" fontFamily="monospace" fontWeight="bold">SG90</text>
      <text x={12} y={10} textAnchor="middle" fontSize={5.5} fill="#93C5FD" fontFamily="monospace">SERVO</text>

      {/* Horn Gear Base */}
      <circle cx={-12} cy={pivotY} r={10} fill="#1D4ED8" stroke="#1E40AF" strokeWidth={1.5} />

      {/* Rotating Horn Assembly (Only this rotates!) */}
      <g
        style={{
          transform: `rotate(${hornAngle}deg)`,
          transformOrigin: `-12px ${pivotY}px`,
          transition: 'transform 0.18s cubic-bezier(0.25, 0.8, 0.25, 1)',
        }}
      >
        {/* White plastic horn arm */}
        <path
          d="M -12,-4 L 18,-2 A 4,4 0 0,1 18,2 L -12,4 Z"
          fill="#F3F4F6"
          stroke="#D1D5DB"
          strokeWidth={1.2}
        />
        <circle cx={-12} cy={pivotY} r={6} fill="#FFF" stroke="#D1D5DB" strokeWidth={1.2} />
        {/* Position indicator dots on horn */}
        <circle cx={4} cy={pivotY} r={1} fill="#9CA3AF" />
        <circle cx={11} cy={pivotY} r={1} fill="#9CA3AF" />
        {/* Center screw */}
        <circle cx={-12} cy={pivotY} r={2} fill="#4B5563" />
      </g>

      {/* Angle Readout */}
      <text x={10} y={15} textAnchor="middle" fontSize={5.5} fill="#F3F4F6" fontFamily="monospace">
        {clampedAngle}°
      </text>
    </g>
  );
}
