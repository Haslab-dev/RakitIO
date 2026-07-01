export { LED } from './LED';
export { Button } from './Button';
export { Resistor } from './Resistor';
export { Potentiometer } from './Potentiometer';
export { Servo } from './Servo';
export { OLED } from './OLED';
export { LCD16x2 } from './LCD16x2';
export { DHT22 } from './DHT22';
export { BME280 } from './BME280';
export { RGBLED } from './RGBLED';
export { Relay } from './Relay';
export { Buzzer } from './Buzzer';
export { HCSR04 } from './HCSR04';
export { LDR } from './LDR';
export { PIR } from './PIR';

import { LED } from './LED';
import { Button } from './Button';
import { Resistor } from './Resistor';
import { Potentiometer } from './Potentiometer';
import { Servo } from './Servo';
import { OLED } from './OLED';
import { LCD16x2 } from './LCD16x2';
import { DHT22 } from './DHT22';
import { BME280 } from './BME280';
import { RGBLED } from './RGBLED';
import { Relay } from './Relay';
import { Buzzer } from './Buzzer';
import { HCSR04 } from './HCSR04';
import { LDR } from './LDR';
import { PIR } from './PIR';

interface ComponentRendererProps {
  definitionId: string;
  x?: number;
  y?: number;
  rotation?: number;
  color?: string;
  on?: boolean;
  pressed?: boolean;
  resistance?: number;
  position?: number;
  angle?: number;
  text?: string;
  r?: number;
  g?: number;
  b?: number;
  active?: boolean;
  frequency?: number;
  distance?: number;
  brightness?: number;
  motion?: boolean;
}

export function ComponentRenderer({
  definitionId,
  x = 0,
  y = 0,
  rotation = 0,
  ...props
}: ComponentRendererProps) {
  switch (definitionId) {
    case 'led':
      return <LED x={x} y={y} rotation={rotation} color={props.color} on={props.on} />;
    case 'button':
      return <Button x={x} y={y} rotation={rotation} pressed={props.pressed} />;
    case 'resistor':
      return <Resistor x={x} y={y} rotation={rotation} resistance={props.resistance} />;
    case 'potentiometer':
      return <Potentiometer x={x} y={y} rotation={rotation} position={props.position} />;
    case 'servo':
      return <Servo x={x} y={y} rotation={rotation} angle={props.angle} />;
    case 'oled':
    case 'ssd1306':
      return <OLED x={x} y={y} rotation={rotation} text={props.text} />;
    case 'lcd16x2':
      return <LCD16x2 x={x} y={y} rotation={rotation} text={props.text} />;
    case 'dht22':
    case 'am2302':
    case 'dht11':
      return <DHT22 x={x} y={y} rotation={rotation} />;
    case 'bme280':
      return <BME280 x={x} y={y} rotation={rotation} />;
    case 'rgb-led':
    case 'rgbled':
    case 'rgb':
      return <RGBLED x={x} y={y} rotation={rotation} r={props.r} g={props.g} b={props.b} />;
    case 'relay':
      return <Relay x={x} y={y} rotation={rotation} active={props.active} />;
    case 'buzzer':
      return <Buzzer x={x} y={y} rotation={rotation} active={props.active} frequency={props.frequency} />;
    case 'hcsr04':
    case 'ultrasonic':
      return <HCSR04 x={x} y={y} rotation={rotation} distance={props.distance} />;
    case 'ldr':
    case 'light':
      return <LDR x={x} y={y} rotation={rotation} resistance={props.resistance} brightness={props.brightness} />;
    case 'pir':
    case 'motion':
      return <PIR x={x} y={y} rotation={rotation} motion={props.motion} />;
    default:
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
          <rect x={-15} y={-15} width={30} height={30} rx={4} fill="#333" stroke="#555" strokeWidth={1} />
          <text x={0} y={2} textAnchor="middle" fontSize={6} fill="#888" fontFamily="monospace">?</text>
          <text x={0} y={20} textAnchor="middle" fontSize={5} fill="#666" fontFamily="monospace">
            {definitionId}
          </text>
        </g>
      );
  }
}
