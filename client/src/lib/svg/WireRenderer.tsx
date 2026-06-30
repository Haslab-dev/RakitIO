import type { WirePoint } from '../types';

interface WireRendererProps {
  points: WirePoint[];
  color?: string;
  selected?: boolean;
  onClick?: () => void;
  strokeWidth?: number;
  glow?: boolean;
  dashed?: boolean;
  flashing?: boolean;
}

function buildBezierPath(points: WirePoint[]): string {
  if (points.length < 2) return '';

  const segments: string[] = [];
  segments.push(`M ${points[0].x} ${points[0].y}`);

  if (points.length === 2) {
    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const cx = dist * 0.4;
    segments.push(
      `C ${points[0].x + cx} ${points[0].y}, ${points[1].x - cx} ${points[1].y}, ${points[1].x} ${points[1].y}`
    );
  } else {
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      const prevPrev = points[i - 2];

      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const tension = dist * 0.35;

      let cp1x: number, cp1y: number, cp2x: number, cp2y: number;

      if (i === 1) {
        cp1x = prev.x + tension * (dx / dist || 1);
        cp1y = prev.y + tension * (dy / dist || 0);
      } else {
        const pdx = prev.x - prevPrev.x;
        const pdy = prev.y - prevPrev.y;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        cp1x = prev.x + tension * (pdx / pdist || 0);
        cp1y = prev.y + tension * (pdy / pdist || 1);
      }

      if (next) {
        const ndx = next.x - curr.x;
        const ndy = next.y - curr.y;
        const ndist = Math.sqrt(ndx * ndx + ndy * ndy);
        cp2x = curr.x - tension * (ndx / ndist || 1);
        cp2y = curr.y - tension * (ndy / ndist || 0);
      } else {
        cp2x = curr.x - tension * (dx / dist || 1);
        cp2y = curr.y - tension * (dy / dist || 0);
      }

      segments.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`);
    }
  }

  return segments.join(' ');
}

export function WireRenderer({
  points,
  color = '#22C55E',
  selected = false,
  onClick,
  strokeWidth = 3.5,
  glow = false,
  dashed = false,
  flashing = false,
}: WireRendererProps) {
  const path = buildBezierPath(points);
  if (!path) return null;

  const colorClean = color.replace('#', '');

  return (
    <g
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Dynamic CSS Injection for Animations */}
      {dashed && (
        <style>{`
          @keyframes wireDash {
            to { stroke-dashoffset: -20; }
          }
          .wire-dashed-${colorClean} {
            stroke-dasharray: 6, 4;
            animation: wireDash 1s linear infinite;
          }
        `}</style>
      )}
      {flashing && (
        <style>{`
          @keyframes wireFlash {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
          .wire-flashing-${colorClean} {
            animation: wireFlash 0.4s ease-in-out infinite;
          }
        `}</style>
      )}

      {/* Wire Drop Shadow (Creates 3D Depth) */}
      <path
        d={path}
        fill="none"
        stroke="#000000"
        strokeWidth={strokeWidth}
        opacity={0.12}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0, 1.2)"
        pointerEvents="none"
      />

      {/* Glow Underlay */}
      {glow && (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 6}
          opacity={0.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={flashing ? `wire-flashing-${colorClean}` : ''}
        />
      )}

      {/* Hover Target Area */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth + 6}
        strokeOpacity={0}
      />

      {/* Main Wire Path */}
      <path
        d={path}
        fill="none"
        stroke={selected ? '#FBBF24' : color}
        strokeWidth={selected ? strokeWidth + 1.5 : strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={selected ? 1 : 0.9}
        className={[
          dashed ? `wire-dashed-${colorClean}` : '',
          flashing ? `wire-flashing-${colorClean}` : '',
        ].filter(Boolean).join(' ')}
      />

      {/* Wire Connection Terminals */}
      {points.length > 0 && (
        <>
          <circle cx={points[0].x} cy={points[0].y} r={2.8} fill="#FFFFFF" stroke={color} strokeWidth={1} />
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={2.8} fill="#FFFFFF" stroke={color} strokeWidth={1} />
        </>
      )}
    </g>
  );
}
