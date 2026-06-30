import type { PinDefinition } from './pin';

export type BoardFamily = 'arduino' | 'esp' | 'rp2040' | 'stm32';

export interface BoardDefinition {
  id: string;
  name: string;
  family: BoardFamily;
  variant: string;
  mcu: string;
  voltage: number;
  clockSpeed: number;
  flashSize: number;
  sramSize: number;
  digitalPins: number;
  analogInputs: number;
  pwmPins: number[];
  pins: PinDefinition[];
  width: number;
  height: number;
  svgComponentId: string;
  defaultSerialPins: { tx: string; rx: string };
  defaultI2CPins: { sda: string; scl: string };
  defaultSPIPins: { mosi: string; miso: string; sck: string; cs: string };
  wifiCapable: boolean;
  bleCapable: boolean;
}
