import type { PinMode } from '../types';

const PIN_COLORS: Record<string, string> = {
  INPUT: '#3B82F6',
  OUTPUT: '#3B82F6',
  INPUT_PULLUP: '#3B82F6',
  PWM: '#EAB308',
  ANALOG: '#22C55E',
  I2C_SDA: '#A855F7',
  I2C_SCL: '#A855F7',
  SPI_MOSI: '#F97316',
  SPI_MISO: '#F97316',
  SPI_SCK: '#F97316',
  SPI_CS: '#F97316',
  GND: '#1F2937',
  VCC: '#EF4444',
  VIN: '#EF4444',
};

interface PinRendererProps {
  x: number;
  y: number;
  mode?: PinMode;
  selected?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
  label?: string;
  radius?: number;
}

export function PinRenderer({
  x,
  y,
  mode = 'INPUT',
  selected = false,
  highlighted = false,
  onClick,
  label,
  radius = 6,
}: PinRendererProps) {
  const color = PIN_COLORS[mode] || '#3B82F6';
  const strokeColor = selected ? '#FBBF24' : highlighted ? '#60A5FA' : '#D1D5DB';
  const strokeWidth = selected ? 3 : highlighted ? 2 : 1;
  const fillColor = selected ? '#FEF3C7' : highlighted ? '#DBEAFE' : '#F9FAFB';

  return (
    <g
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <circle
        cx={x}
        cy={y}
        r={radius + 4}
        fill="transparent"
      />
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={x}
        cy={y}
        r={radius * 0.45}
        fill={color}
        opacity={selected ? 1 : 0.8}
      />
      {label && (
        <text
          x={x}
          y={y - radius - 6}
          textAnchor="middle"
          fontSize={9}
          fontFamily="monospace"
          fill="#6B7280"
        >
          {label}
        </text>
      )}
    </g>
  );
}
