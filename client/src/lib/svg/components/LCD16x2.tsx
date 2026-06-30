interface LCD16x2Props {
  text?: string;
  x: number;
  y: number;
  rotation?: number;
}

export function LCD16x2({ text = '', x, y, rotation = 0 }: LCD16x2Props) {
  const pcbW = 124;
  const pcbH = 74;
  const screenW = 98;
  const screenH = 34;

  // Split text into two 16-character lines
  const cleanText = text || '';
  const line1 = cleanText.slice(0, 16).padEnd(16, ' ');
  const line2 = cleanText.slice(16, 32).padEnd(16, ' ');

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* 4 Metal Lead Pins at the bottom */}
      <line x1={-39} y1={32} x2={-39} y2={24} stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />
      <line x1={-13} y1={32} x2={-13} y2={24} stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />
      <line x1={13} y1={32} x2={13} y2={24} stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />
      <line x1={39} y1={32} x2={39} y2={24} stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />

      {/* PCB Base (Flat Dark Green Board) */}
      <rect
        x={-pcbW / 2}
        y={-pcbH / 2}
        width={pcbW}
        height={pcbH}
        rx={4}
        fill="#064E3B"
        stroke="#047857"
        strokeWidth={2}
      />
      {/* 4 copper mounting holes */}
      <circle cx={-pcbW / 2 + 4} cy={-pcbH / 2 + 4} r={2.5} fill="none" stroke="#D97706" strokeWidth={1} />
      <circle cx={pcbW / 2 - 4} cy={-pcbH / 2 + 4} r={2.5} fill="none" stroke="#D97706" strokeWidth={1} />
      <circle cx={-pcbW / 2 + 4} cy={pcbH / 2 - 12} r={2.5} fill="none" stroke="#D97706" strokeWidth={1} />
      <circle cx={pcbW / 2 - 4} cy={pcbH / 2 - 12} r={2.5} fill="none" stroke="#D97706" strokeWidth={1} />

      {/* LCD Screen Bezel (Flat Dark Grey) */}
      <rect
        x={-screenW / 2 - 2}
        y={-pcbH / 2 + 6}
        width={screenW + 4}
        height={screenH + 4}
        rx={3}
        fill="#1F2937"
        stroke="#374151"
        strokeWidth={1.8}
      />

      {/* Yellow-Green LCD Screen Backlight */}
      <rect
        x={-screenW / 2}
        y={-pcbH / 2 + 8}
        width={screenW}
        height={screenH}
        rx={1.5}
        fill="#A3E635"
      />

      {/* 16x2 Character Text (Dark, high-contrast monospace) */}
      <g>
        <text
          x={-screenW / 2 + 6}
          y={-pcbH / 2 + 20}
          fontSize={11}
          fill="#111827"
          fontFamily="Courier, monospace"
          fontWeight="bold"
          letterSpacing={2}
        >
          {line1}
        </text>
        <text
          x={-screenW / 2 + 6}
          y={-pcbH / 2 + 35}
          fontSize={11}
          fill="#111827"
          fontFamily="Courier, monospace"
          fontWeight="bold"
          letterSpacing={2}
        >
          {line2}
        </text>
      </g>

      {/* Pin labels above header */}
      <text x={-39} y={22} fontSize={5} fill="#A7F3D0" fontFamily="monospace" textAnchor="middle" fontWeight="bold">GND</text>
      <text x={-13} y={22} fontSize={5} fill="#A7F3D0" fontFamily="monospace" textAnchor="middle" fontWeight="bold">VCC</text>
      <text x={13} y={22} fontSize={5} fill="#A7F3D0" fontFamily="monospace" textAnchor="middle" fontWeight="bold">SCL</text>
      <text x={39} y={22} fontSize={5} fill="#A7F3D0" fontFamily="monospace" textAnchor="middle" fontWeight="bold">SDA</text>
    </g>
  );
}