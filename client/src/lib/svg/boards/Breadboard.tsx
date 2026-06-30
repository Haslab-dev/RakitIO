
interface BreadboardProps {
  width?: number;
  height?: number;
}

const COLUMNS = 63;
const ROWS_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const HOLE_SPACING = 14;
const HOLE_RADIUS = 3;
const RAIL_HEIGHT = 20;
const BOARD_PADDING = 30;
const CHANNEL_HEIGHT = 20;

export function Breadboard({ width: propWidth, height: propHeight }: BreadboardProps) {
  const contentW = COLUMNS * HOLE_SPACING;
  const contentH = RAIL_HEIGHT * 2 + CHANNEL_HEIGHT + ROWS_LABELS.length * HOLE_SPACING;
  const totalW = contentW + BOARD_PADDING * 2;
  const totalH = contentH + BOARD_PADDING * 2 + 30;

  const scaleX = propWidth ? propWidth / totalW : 1;
  const scaleY = propHeight ? propHeight / totalH : 1;

  const boardX = BOARD_PADDING;
  const boardY = BOARD_PADDING;

  const topRailY = boardY;
  const topSectionY = topRailY + RAIL_HEIGHT + 10;
  const channelY = topSectionY + 5 * HOLE_SPACING;
  const bottomSectionY = channelY + CHANNEL_HEIGHT;
  const bottomRailY = bottomSectionY + 5 * HOLE_SPACING + 10;

  return (
    <svg
      width={propWidth || totalW}
      height={propHeight || totalH}
      viewBox={propWidth ? undefined : `0 0 ${totalW} ${totalH}`}
    >
      <g transform={propWidth && propHeight ? `scale(${scaleX}, ${scaleY})` : undefined}>
        <defs>
          <filter id="bb-shadow">
            <feDropShadow dx="1" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Board body */}
        <rect
          x={boardX - 10}
          y={boardY - 10}
          width={contentW + 20}
          height={bottomRailY - boardY + RAIL_HEIGHT + 20}
          rx={6} ry={6}
          fill="#F5F0E1"
          stroke="#D4C9A8"
          strokeWidth={2}
          filter="url(#bb-shadow)"
        />

        {/* Top power rail - red strip */}
        <rect x={boardX - 5} y={topRailY} width={contentW + 10} height={8} rx={2} fill="#EF4444" opacity={0.7} />
        <rect x={boardX - 5} y={topRailY + 10} width={contentW + 10} height={8} rx={2} fill="#3B82F6" opacity={0.7} />

        {/* Top power rail holes */}
        {Array.from({ length: COLUMNS }, (_, col) => (
          <g key={`top-rail-${col}`}>
            <circle cx={boardX + col * HOLE_SPACING} cy={topRailY + 4} r={HOLE_RADIUS} fill="#333" opacity={0.6} />
            <circle cx={boardX + col * HOLE_SPACING} cy={topRailY + 14} r={HOLE_RADIUS} fill="#333" opacity={0.6} />
          </g>
        ))}

        {/* Top power rail labels */}
        <text x={boardX - 18} y={topRailY + 6} fontSize={7} fill="#EF4444" fontFamily="monospace" fontWeight="bold">+</text>
        <text x={boardX - 18} y={topRailY + 16} fontSize={7} fill="#3B82F6" fontFamily="monospace" fontWeight="bold">−</text>

        {/* Top section (rows a-e) */}
        {ROWS_LABELS.slice(0, 5).map((row, rowIdx) => (
          <g key={`top-row-${row}`}>
            <text x={boardX - 18} y={topSectionY + rowIdx * HOLE_SPACING + 4} fontSize={8} fill="#888" fontFamily="monospace">
              {row}
            </text>
            {Array.from({ length: COLUMNS }, (_, col) => (
              <circle
                key={`hole-${row}-${col}`}
                cx={boardX + col * HOLE_SPACING}
                cy={topSectionY + rowIdx * HOLE_SPACING}
                r={HOLE_RADIUS}
                fill="#444"
                opacity={0.5}
              />
            ))}
          </g>
        ))}

        {/* Center channel */}
        <rect
          x={boardX - 5}
          y={channelY}
          width={contentW + 10}
          height={CHANNEL_HEIGHT}
          rx={3}
          fill="#E8E0CC"
          stroke="#D4C9A8"
          strokeWidth={0.5}
        />
        <text x={boardX + contentW / 2} y={channelY + CHANNEL_HEIGHT / 2 + 3} textAnchor="middle" fontSize={7} fill="#B0A890" fontFamily="monospace">
          BREADBOARD
        </text>

        {/* Column numbers along channel */}
        {Array.from({ length: COLUMNS }, (_, col) => (
          (col % 5 === 0 || col === COLUMNS - 1) && (
            <text
              key={`colnum-${col}`}
              x={boardX + col * HOLE_SPACING}
              y={channelY - 3}
              textAnchor="middle"
              fontSize={5}
              fill="#AAA"
              fontFamily="monospace"
            >
              {col + 1}
            </text>
          )
        ))}

        {/* Bottom section (rows f-j) */}
        {ROWS_LABELS.slice(5).map((row, rowIdx) => (
          <g key={`bottom-row-${row}`}>
            <text x={boardX - 18} y={bottomSectionY + rowIdx * HOLE_SPACING + 4} fontSize={8} fill="#888" fontFamily="monospace">
              {row}
            </text>
            {Array.from({ length: COLUMNS }, (_, col) => (
              <circle
                key={`hole-${row}-${col}`}
                cx={boardX + col * HOLE_SPACING}
                cy={bottomSectionY + rowIdx * HOLE_SPACING}
                r={HOLE_RADIUS}
                fill="#444"
                opacity={0.5}
              />
            ))}
          </g>
        ))}

        {/* Bottom power rail - red strip */}
        <rect x={boardX - 5} y={bottomRailY} width={contentW + 10} height={8} rx={2} fill="#EF4444" opacity={0.7} />
        <rect x={boardX - 5} y={bottomRailY + 10} width={contentW + 10} height={8} rx={2} fill="#3B82F6" opacity={0.7} />

        {/* Bottom power rail holes */}
        {Array.from({ length: COLUMNS }, (_, col) => (
          <g key={`bottom-rail-${col}`}>
            <circle cx={boardX + col * HOLE_SPACING} cy={bottomRailY + 4} r={HOLE_RADIUS} fill="#333" opacity={0.6} />
            <circle cx={boardX + col * HOLE_SPACING} cy={bottomRailY + 14} r={HOLE_RADIUS} fill="#333" opacity={0.6} />
          </g>
        ))}

        {/* Bottom power rail labels */}
        <text x={boardX - 18} y={bottomRailY + 6} fontSize={7} fill="#EF4444" fontFamily="monospace" fontWeight="bold">+</text>
        <text x={boardX - 18} y={bottomRailY + 16} fontSize={7} fill="#3B82F6" fontFamily="monospace" fontWeight="bold">−</text>
      </g>
    </svg>
  );
}
