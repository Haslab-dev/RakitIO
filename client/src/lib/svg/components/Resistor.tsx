
interface ResistorProps {
  resistance?: number;
  x: number;
  y: number;
  rotation?: number;
}

const BAND_COLORS: Record<string, string> = {
  '0': '#000000',
  '1': '#8B4513',
  '2': '#FF0000',
  '3': '#FF8C00',
  '4': '#FFFF00',
  '5': '#228B22',
  '6': '#0000FF',
  '7': '#8B008B',
  '8': '#808080',
  '9': '#FFFFFF',
};

function getColorBands(resistance: number): string[] {
  const str = Math.round(resistance).toString();
  const digits = str.split('').map(Number);
  const colors: string[] = [];

  if (digits.length >= 3) {
    colors.push(
      BAND_COLORS[String(digits[0])] || '#000',
      BAND_COLORS[String(digits[1])] || '#000',
      BAND_COLORS[String(digits.length - 2)] || '#000'
    );
  } else if (digits.length === 2) {
    colors.push(
      BAND_COLORS[String(digits[0])] || '#000',
      BAND_COLORS[String(digits[1])] || '#000',
      BAND_COLORS['0']
    );
  } else {
    colors.push(
      BAND_COLORS[String(digits[0])] || '#000',
      BAND_COLORS['0'],
      BAND_COLORS['0']
    );
  }

  colors.push('#C0A060');
  return colors;
}

export function Resistor({ resistance = 220, x, y, rotation = 0 }: ResistorProps) {
  const bands = getColorBands(resistance);
  const bodyW = 40;
  const bodyH = 14;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* Wire leads */}
      <line x1={-30} y1={0} x2={-bodyW / 2} y2={0} stroke="#888" strokeWidth={1.5} />
      <line x1={bodyW / 2} y1={0} x2={30} y2={0} stroke="#888" strokeWidth={1.5} />

      {/* Resistor body */}
      <rect
        x={-bodyW / 2}
        y={-bodyH / 2}
        width={bodyW}
        height={bodyH}
        rx={3}
        ry={3}
        fill="#D2B48C"
        stroke="#A0845C"
        strokeWidth={0.8}
      />

      {/* Body shading */}
      <rect
        x={-bodyW / 2 + 2}
        y={-bodyH / 2 + 1}
        width={bodyW - 4}
        height={3}
        rx={1}
        fill="white"
        opacity={0.15}
      />

      {/* Color bands */}
      {bands.map((color, i) => {
        const bandX = -bodyW / 2 + 8 + i * 8;
        return (
          <rect
            key={i}
            x={bandX}
            y={-bodyH / 2 + 1}
            width={4}
            height={bodyH - 2}
            rx={0.5}
            fill={color}
            stroke={color === '#FFFFFF' ? '#CCC' : 'none'}
            strokeWidth={0.3}
          />
        );
      })}

      {/* Value label */}
      <text x={0} y={bodyH / 2 + 10} textAnchor="middle" fontSize={6} fill="#888" fontFamily="monospace">
        {resistance >= 1000 ? `${(resistance / 1000).toFixed(resistance % 1000 === 0 ? 0 : 1)}kΩ` : `${resistance}Ω`}
      </text>
    </g>
  );
}
