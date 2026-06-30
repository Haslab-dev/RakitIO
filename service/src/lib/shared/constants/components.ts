import type { ComponentDefinition } from '../types/component';

export const LED: ComponentDefinition = {
  id: 'led',
  name: 'LED',
  category: 'led',
  description: 'Light-emitting diode. Emits light when current flows through it in the forward direction.',
  icon: 'led',
  svgComponentId: 'comp-led',
  width: 30,
  height: 40,
  pins: [
    { id: 'anode', name: 'Anode (+)', x: 15, y: 0, modes: ['output'], required: true, description: 'Positive terminal (longer leg)' },
    { id: 'cathode', name: 'Cathode (-)', x: 15, y: 40, modes: ['input'], required: true, description: 'Negative terminal (shorter leg)' },
  ],
  properties: [
    {
      key: 'color',
      label: 'Color',
      type: 'select',
      default: 'red',
      options: [
        { label: 'Red', value: 'red' },
        { label: 'Green', value: 'green' },
        { label: 'Blue', value: 'blue' },
        { label: 'Yellow', value: 'yellow' },
        { label: 'White', value: 'white' },
        { label: 'Orange', value: 'orange' },
      ],
      description: 'LED emission color',
    },
    {
      key: 'forwardVoltage',
      label: 'Forward Voltage (V)',
      type: 'number',
      default: 2.0,
      min: 1.5,
      max: 3.6,
      step: 0.1,
      description: 'Typical forward voltage drop',
    },
  ],
  libraries: [],
  tags: ['output', 'indicator', 'light', 'basic'],
};

export const BUTTON: ComponentDefinition = {
  id: 'button',
  name: 'Push Button',
  category: 'button',
  description: 'Momentary tactile push button. Provides a temporary connection when pressed.',
  icon: 'button',
  svgComponentId: 'comp-button',
  width: 40,
  height: 40,
  pins: [
    { id: 'pin1', name: 'Pin 1', x: 10, y: 0, modes: ['input', 'output'], required: true },
    { id: 'pin2', name: 'Pin 2', x: 30, y: 0, modes: ['input', 'output'], required: true },
  ],
  properties: [
    {
      key: 'normallyOpen',
      label: 'Normally Open',
      type: 'boolean',
      default: true,
      description: 'If true, the circuit is open when the button is not pressed',
    },
  ],
  libraries: [],
  tags: ['input', 'switch', 'tactile', 'basic'],
};

export const RESISTOR: ComponentDefinition = {
  id: 'resistor',
  name: 'Resistor',
  category: 'resistor',
  description: 'Passive component that limits current flow. Measured in Ohms.',
  icon: 'resistor',
  svgComponentId: 'comp-resistor',
  width: 60,
  height: 20,
  pins: [
    { id: 'pin1', name: 'Pin 1', x: 0, y: 10, modes: ['input', 'output'], required: true },
    { id: 'pin2', name: 'Pin 2', x: 60, y: 10, modes: ['input', 'output'], required: true },
  ],
  properties: [
    {
      key: 'resistance',
      label: 'Resistance (Ω)',
      type: 'number',
      default: 1000,
      min: 0,
      max: 10000000,
      step: 1,
      description: 'Resistance value in Ohms',
    },
    {
      key: 'tolerance',
      label: 'Tolerance (%)',
      type: 'select',
      default: 5,
      options: [
        { label: '1%', value: 1 },
        { label: '2%', value: 2 },
        { label: '5%', value: 5 },
        { label: '10%', value: 10 },
      ],
      description: 'Manufacturing tolerance',
    },
  ],
  libraries: [],
  tags: ['passive', 'current-limiting', 'pull-up', 'pull-down', 'basic'],
};

export const POTENTIOMETER: ComponentDefinition = {
  id: 'potentiometer',
  name: 'Potentiometer',
  category: 'input',
  description: 'Variable resistor with three terminals. Acts as an adjustable voltage divider.',
  icon: 'potentiometer',
  svgComponentId: 'comp-potentiometer',
  width: 50,
  height: 50,
  pins: [
    { id: 'wiper', name: 'Wiper', x: 25, y: 0, modes: ['analog'], required: true, description: 'Adjustable output' },
    { id: 'high', name: 'High', x: 0, y: 50, modes: ['input'], required: true, description: 'Maximum voltage terminal' },
    { id: 'low', name: 'Low', x: 50, y: 50, modes: ['input'], required: true, description: 'Ground terminal' },
  ],
  properties: [
    {
      key: 'resistance',
      label: 'Max Resistance (Ω)',
      type: 'number',
      default: 10000,
      min: 100,
      max: 1000000,
      step: 100,
      description: 'Total resistance of the potentiometer',
    },
    {
      key: 'position',
      label: 'Position (%)',
      type: 'number',
      default: 50,
      min: 0,
      max: 100,
      step: 1,
      description: 'Current wiper position (0–100%)',
    },
  ],
  libraries: [],
  tags: ['input', 'variable', 'voltage-divider', 'analog'],
};

export const DHT22: ComponentDefinition = {
  id: 'dht22',
  name: 'DHT22',
  category: 'sensor',
  description: 'Digital temperature and humidity sensor with single-wire interface.',
  icon: 'dht22',
  svgComponentId: 'comp-dht22',
  width: 40,
  height: 50,
  pins: [
    { id: 'vcc', name: 'VCC', x: 10, y: 0, modes: ['input'], required: true, description: 'Power supply (3.3–5V)' },
    { id: 'data', name: 'DATA', x: 20, y: 0, modes: ['input', 'output'], required: true, description: 'Single-wire data line' },
    { id: 'gnd', name: 'GND', x: 30, y: 0, modes: ['input'], required: true, description: 'Ground' },
  ],
  properties: [
    {
      key: 'readInterval',
      label: 'Read Interval (ms)',
      type: 'number',
      default: 2000,
      min: 500,
      max: 10000,
      step: 100,
      description: 'Minimum time between readings',
    },
  ],
  libraries: ['DHT sensor library'],
  tags: ['sensor', 'temperature', 'humidity', 'digital', 'environmental'],
};

export const BME280: ComponentDefinition = {
  id: 'bme280',
  name: 'BME280',
  category: 'sensor',
  description: 'I2C/SPI temperature, humidity, and pressure sensor.',
  icon: 'bme280',
  svgComponentId: 'comp-bme280',
  width: 50,
  height: 40,
  pins: [
    { id: 'vcc', name: 'VCC', x: 0, y: 0, modes: ['input'], required: true, description: 'Power supply (1.71–3.6V)' },
    { id: 'gnd', name: 'GND', x: 0, y: 40, modes: ['input'], required: true, description: 'Ground' },
    { id: 'sda', name: 'SDA', x: 50, y: 10, modes: ['i2c'], required: true, description: 'I2C data line' },
    { id: 'scl', name: 'SCL', x: 50, y: 30, modes: ['i2c'], required: true, description: 'I2C clock line' },
  ],
  properties: [
    {
      key: 'address',
      label: 'I2C Address',
      type: 'select',
      default: 0x76,
      options: [
        { label: '0x76', value: 0x76 },
        { label: '0x77', value: 0x77 },
      ],
      description: 'I2C slave address (depends on SDO pin)',
    },
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'normal',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Forced', value: 'forced' },
        { label: 'Sleep', value: 'sleep' },
      ],
      description: 'Operating mode',
    },
  ],
  libraries: ['Adafruit BME280 Library'],
  tags: ['sensor', 'temperature', 'humidity', 'pressure', 'i2c', 'environmental'],
};

export const SSD1306_OLED: ComponentDefinition = {
  id: 'ssd1306',
  name: 'SSD1306 OLED',
  category: 'display',
  description: '128×64 pixel monochrome OLED display with I2C interface.',
  icon: 'oled',
  svgComponentId: 'comp-ssd1306',
  width: 70,
  height: 40,
  pins: [
    { id: 'vcc', name: 'VCC', x: 0, y: 0, modes: ['input'], required: true, description: 'Power supply (3.3–5V)' },
    { id: 'gnd', name: 'GND', x: 0, y: 40, modes: ['input'], required: true, description: 'Ground' },
    { id: 'sda', name: 'SDA', x: 70, y: 10, modes: ['i2c'], required: true, description: 'I2C data line' },
    { id: 'scl', name: 'SCL', x: 70, y: 30, modes: ['i2c'], required: true, description: 'I2C clock line' },
  ],
  properties: [
    {
      key: 'address',
      label: 'I2C Address',
      type: 'select',
      default: 0x3C,
      options: [
        { label: '0x3C', value: 0x3C },
        { label: '0x3D', value: 0x3D },
      ],
      description: 'I2C slave address',
    },
    {
      key: 'width',
      label: 'Width',
      type: 'number',
      default: 128,
      options: [
        { label: '128', value: 128 },
        { label: '64', value: 64 },
      ],
      description: 'Display width in pixels',
    },
    {
      key: 'height',
      label: 'Height',
      type: 'number',
      default: 64,
      options: [
        { label: '64', value: 64 },
        { label: '32', value: 32 },
      ],
      description: 'Display height in pixels',
    },
  ],
  libraries: ['Adafruit SSD1306', 'Adafruit GFX Library'],
  tags: ['display', 'oled', 'i2c', 'graphics', 'text'],
};

export const SERVO: ComponentDefinition = {
  id: 'servo',
  name: 'Servo Motor',
  category: 'actuator',
  description: 'RC servo motor with PWM control for precise angular positioning.',
  icon: 'servo',
  svgComponentId: 'comp-servo',
  width: 50,
  height: 50,
  pins: [
    { id: 'vcc', name: 'VCC (Red)', x: 0, y: 10, modes: ['input'], required: true, description: 'Power supply (4.8–6V)' },
    { id: 'gnd', name: 'GND (Brown)', x: 0, y: 30, modes: ['input'], required: true, description: 'Ground' },
    { id: 'signal', name: 'SIGNAL (Orange)', x: 50, y: 20, modes: ['pwm'], required: true, description: 'PWM control signal' },
  ],
  properties: [
    {
      key: 'minAngle',
      label: 'Min Angle (°)',
      type: 'number',
      default: 0,
      min: 0,
      max: 180,
      step: 1,
      description: 'Minimum rotation angle',
    },
    {
      key: 'maxAngle',
      label: 'Max Angle (°)',
      type: 'number',
      default: 180,
      min: 0,
      max: 180,
      step: 1,
      description: 'Maximum rotation angle',
    },
    {
      key: 'minPulse',
      label: 'Min Pulse (μs)',
      type: 'number',
      default: 544,
      min: 400,
      max: 1000,
      step: 1,
      description: 'Pulse width for minimum angle',
    },
    {
      key: 'maxPulse',
      label: 'Max Pulse (μs)',
      type: 'number',
      default: 2400,
      min: 1500,
      max: 3000,
      step: 1,
      description: 'Pulse width for maximum angle',
    },
  ],
  libraries: ['Servo'],
  tags: ['actuator', 'motor', 'pwm', 'rotation', 'position'],
};

export const RELAY: ComponentDefinition = {
  id: 'relay',
  name: 'Relay Module',
  category: 'actuator',
  description: 'Electromagnetic relay for switching high-voltage/high-current loads with digital control.',
  icon: 'relay',
  svgComponentId: 'comp-relay',
  width: 50,
  height: 40,
  pins: [
    { id: 'vcc', name: 'VCC', x: 0, y: 0, modes: ['input'], required: true, description: 'Power supply (5V or 3.3V)' },
    { id: 'gnd', name: 'GND', x: 0, y: 40, modes: ['input'], required: true, description: 'Ground' },
    { id: 'in', name: 'IN', x: 50, y: 20, modes: ['output'], required: true, description: 'Control signal input' },
  ],
  properties: [
    {
      key: 'activeLow',
      label: 'Active Low',
      type: 'boolean',
      default: false,
      description: 'If true, relay activates on LOW signal',
    },
    {
      key: 'channels',
      label: 'Channels',
      type: 'select',
      default: 1,
      options: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '4', value: 4 },
        { label: '8', value: 8 },
      ],
      description: 'Number of relay channels',
    },
  ],
  libraries: [],
  tags: ['actuator', 'switch', 'relay', 'high-voltage', 'digital'],
};

export const GPS_MODULE: ComponentDefinition = {
  id: 'gps-module',
  name: 'GPS Module',
  category: 'sensor',
  description: 'UART GPS receiver for geographic positioning and time synchronization.',
  icon: 'gps',
  svgComponentId: 'comp-gps',
  width: 50,
  height: 40,
  pins: [
    { id: 'vcc', name: 'VCC', x: 0, y: 0, modes: ['input'], required: true, description: 'Power supply (3.3–5V)' },
    { id: 'gnd', name: 'GND', x: 0, y: 40, modes: ['input'], required: true, description: 'Ground' },
    { id: 'tx', name: 'TX', x: 50, y: 10, modes: ['serial'], required: true, description: 'UART transmit (connect to board RX)' },
    { id: 'rx', name: 'RX', x: 50, y: 30, modes: ['serial'], required: false, description: 'UART receive (connect to board TX)' },
  ],
  properties: [
    {
      key: 'baudRate',
      label: 'Baud Rate',
      type: 'select',
      default: 9600,
      options: [
        { label: '4800', value: 4800 },
        { label: '9600', value: 9600 },
        { label: '38400', value: 38400 },
        { label: '57600', value: 57600 },
        { label: '115200', value: 115200 },
      ],
      description: 'UART communication speed',
    },
    {
      key: 'updateRate',
      label: 'Update Rate (Hz)',
      type: 'select',
      default: 1,
      options: [
        { label: '1 Hz', value: 1 },
        { label: '5 Hz', value: 5 },
        { label: '10 Hz', value: 10 },
      ],
      description: 'Position update frequency',
    },
  ],
  libraries: ['TinyGPS++'],
  tags: ['sensor', 'gps', 'location', 'uart', 'navigation'],
};

export const MPU6050: ComponentDefinition = {
  id: 'mpu6050',
  name: 'MPU6050',
  category: 'sensor',
  description: '6-axis IMU with 3-axis gyroscope and 3-axis accelerometer (I2C).',
  icon: 'mpu6050',
  svgComponentId: 'comp-mpu6050',
  width: 50,
  height: 40,
  pins: [
    { id: 'vcc', name: 'VCC', x: 0, y: 0, modes: ['input'], required: true, description: 'Power supply (2.37–3.46V)' },
    { id: 'gnd', name: 'GND', x: 0, y: 40, modes: ['input'], required: true, description: 'Ground' },
    { id: 'sda', name: 'SDA', x: 50, y: 10, modes: ['i2c'], required: true, description: 'I2C data line' },
    { id: 'scl', name: 'SCL', x: 50, y: 30, modes: ['i2c'], required: true, description: 'I2C clock line' },
  ],
  properties: [
    {
      key: 'address',
      label: 'I2C Address',
      type: 'select',
      default: 0x68,
      options: [
        { label: '0x68', value: 0x68 },
        { label: '0x69', value: 0x69 },
      ],
      description: 'I2C slave address (depends on AD0 pin)',
    },
    {
      key: 'accelRange',
      label: 'Accel Range (g)',
      type: 'select',
      default: 2,
      options: [
        { label: '±2g', value: 2 },
        { label: '±4g', value: 4 },
        { label: '±8g', value: 8 },
        { label: '±16g', value: 16 },
      ],
      description: 'Accelerometer full-scale range',
    },
    {
      key: 'gyroRange',
      label: 'Gyro Range (°/s)',
      type: 'select',
      default: 250,
      options: [
        { label: '±250°/s', value: 250 },
        { label: '±500°/s', value: 500 },
        { label: '±1000°/s', value: 1000 },
        { label: '±2000°/s', value: 2000 },
      ],
      description: 'Gyroscope full-scale range',
    },
  ],
  libraries: ['Adafruit MPU6050'],
  tags: ['sensor', 'imu', 'gyroscope', 'accelerometer', 'i2c', 'motion'],
};

export const BH1750: ComponentDefinition = {
  id: 'bh1750',
  name: 'BH1750 Light Sensor',
  category: 'sensor',
  description: 'Digital ambient light sensor with I2C interface. Measures 1–65535 lux.',
  icon: 'bh1750',
  svgComponentId: 'comp-bh1750',
  width: 50,
  height: 40,
  pins: [
    { id: 'vcc', name: 'VCC', x: 0, y: 0, modes: ['input'], required: true, description: 'Power supply (2.4–3.6V)' },
    { id: 'gnd', name: 'GND', x: 0, y: 40, modes: ['input'], required: true, description: 'Ground' },
    { id: 'sda', name: 'SDA', x: 50, y: 10, modes: ['i2c'], required: true, description: 'I2C data line' },
    { id: 'scl', name: 'SCL', x: 50, y: 30, modes: ['i2c'], required: true, description: 'I2C clock line' },
  ],
  properties: [
    {
      key: 'address',
      label: 'I2C Address',
      type: 'select',
      default: 0x23,
      options: [
        { label: '0x23', value: 0x23 },
        { label: '0x5C', value: 0x5C },
      ],
      description: 'I2C slave address (depends on ADDR pin)',
    },
    {
      key: 'resolution',
      label: 'Resolution',
      type: 'select',
      default: 'high',
      options: [
        { label: 'High (1 lux)', value: 'high' },
        { label: 'High 2 (0.5 lux)', value: 'high2' },
        { label: 'Low (4 lux)', value: 'low' },
      ],
      description: 'Measurement resolution mode',
    },
  ],
  libraries: ['BH1750'],
  tags: ['sensor', 'light', 'lux', 'i2c', 'environmental'],
};

export const DS3231_RTC: ComponentDefinition = {
  id: 'ds3231',
  name: 'DS3231 RTC',
  category: 'sensor',
  description: 'Real-time clock with battery backup and I2C interface. Includes temperature-compensated crystal.',
  icon: 'rtc',
  svgComponentId: 'comp-ds3231',
  width: 60,
  height: 40,
  pins: [
    { id: 'vcc', name: 'VCC', x: 0, y: 0, modes: ['input'], required: true, description: 'Power supply (2.3–5.5V)' },
    { id: 'gnd', name: 'GND', x: 0, y: 40, modes: ['input'], required: true, description: 'Ground' },
    { id: 'sda', name: 'SDA', x: 60, y: 10, modes: ['i2c'], required: true, description: 'I2C data line' },
    { id: 'scl', name: 'SCL', x: 60, y: 30, modes: ['i2c'], required: true, description: 'I2C clock line' },
    { id: 'sqw', name: 'SQW', x: 30, y: 0, modes: ['output'], required: false, description: 'Square wave / alarm output' },
  ],
  properties: [
    {
      key: 'address',
      label: 'I2C Address',
      type: 'select',
      default: 0x68,
      options: [
        { label: '0x68', value: 0x68 },
      ],
      description: 'I2C slave address (fixed)',
    },
    {
      key: 'sqwFrequency',
      label: 'SQW Frequency',
      type: 'select',
      default: 'off',
      options: [
        { label: 'Off', value: 'off' },
        { label: '1 Hz', value: 1 },
        { label: '1.024 kHz', value: 1024 },
        { label: '4.096 kHz', value: 4096 },
        { label: '8.192 kHz', value: 8192 },
      ],
      description: 'Square wave output frequency',
    },
  ],
  libraries: ['RTClib'],
  tags: ['sensor', 'rtc', 'clock', 'time', 'i2c', 'battery'],
};

export const SD_CARD_MODULE: ComponentDefinition = {
  id: 'sd-card',
  name: 'SD Card Module',
  category: 'storage',
  description: 'MicroSD card adapter with SPI interface for data logging and storage.',
  icon: 'sd-card',
  svgComponentId: 'comp-sd-card',
  width: 60,
  height: 50,
  pins: [
    { id: 'vcc', name: 'VCC', x: 0, y: 0, modes: ['input'], required: true, description: 'Power supply (3.3–5V)' },
    { id: 'gnd', name: 'GND', x: 0, y: 50, modes: ['input'], required: true, description: 'Ground' },
    { id: 'miso', name: 'MISO', x: 60, y: 10, modes: ['spi'], required: true, description: 'SPI Master In Slave Out' },
    { id: 'mosi', name: 'MOSI', x: 60, y: 20, modes: ['spi'], required: true, description: 'SPI Master Out Slave In' },
    { id: 'sck', name: 'SCK', x: 60, y: 30, modes: ['spi'], required: true, description: 'SPI clock' },
    { id: 'cs', name: 'CS', x: 60, y: 40, modes: ['spi'], required: true, description: 'SPI chip select' },
  ],
  properties: [
    {
      key: 'csPin',
      label: 'CS Pin',
      type: 'string',
      default: 'D10',
      description: 'Board pin used for chip select',
    },
  ],
  libraries: ['SD'],
  tags: ['storage', 'sd', 'spi', 'data-logging', 'file-system'],
};

export const LORA_MODULE: ComponentDefinition = {
  id: 'lora-module',
  name: 'LoRa Module',
  category: 'communication',
  description: 'Long-range, low-power LoRa radio transceiver (e.g., SX1276/RFM95W) via SPI.',
  icon: 'lora',
  svgComponentId: 'comp-lora',
  width: 60,
  height: 60,
  pins: [
    { id: 'vcc', name: 'VCC', x: 0, y: 0, modes: ['input'], required: true, description: 'Power supply (1.8–3.7V)' },
    { id: 'gnd', name: 'GND', x: 0, y: 60, modes: ['input'], required: true, description: 'Ground' },
    { id: 'miso', name: 'MISO', x: 60, y: 10, modes: ['spi'], required: true, description: 'SPI Master In Slave Out' },
    { id: 'mosi', name: 'MOSI', x: 60, y: 20, modes: ['spi'], required: true, description: 'SPI Master Out Slave In' },
    { id: 'sck', name: 'SCK', x: 60, y: 30, modes: ['spi'], required: true, description: 'SPI clock' },
    { id: 'cs', name: 'CS (NSS)', x: 60, y: 40, modes: ['spi'], required: true, description: 'SPI chip select' },
    { id: 'rst', name: 'RST', x: 30, y: 0, modes: ['output'], required: true, description: 'Reset (active low)' },
    { id: 'dio0', name: 'DIO0', x: 30, y: 60, modes: ['input'], required: true, description: 'Interrupt / TX done / RX done' },
  ],
  properties: [
    {
      key: 'frequency',
      label: 'Frequency (MHz)',
      type: 'select',
      default: 433.0,
      options: [
        { label: '433 MHz', value: 433.0 },
        { label: '868 MHz', value: 868.0 },
        { label: '915 MHz', value: 915.0 },
      ],
      description: 'LoRa radio frequency band',
    },
    {
      key: 'spreadingFactor',
      label: 'Spreading Factor',
      type: 'select',
      default: 7,
      options: [
        { label: 'SF6', value: 6 },
        { label: 'SF7', value: 7 },
        { label: 'SF8', value: 8 },
        { label: 'SF9', value: 9 },
        { label: 'SF10', value: 10 },
        { label: 'SF11', value: 11 },
        { label: 'SF12', value: 12 },
      ],
      description: 'LoRa spreading factor (range vs data rate)',
    },
    {
      key: 'bandwidth',
      label: 'Bandwidth (kHz)',
      type: 'select',
      default: 125,
      options: [
        { label: '7.8 kHz', value: 7.8 },
        { label: '10.4 kHz', value: 10.4 },
        { label: '15.6 kHz', value: 15.6 },
        { label: '20.8 kHz', value: 20.8 },
        { label: '31.25 kHz', value: 31.25 },
        { label: '41.7 kHz', value: 41.7 },
        { label: '62.5 kHz', value: 62.5 },
        { label: '125 kHz', value: 125 },
        { label: '250 kHz', value: 250 },
        { label: '500 kHz', value: 500 },
      ],
      description: 'LoRa signal bandwidth',
    },
  ],
  libraries: ['LoRa'],
  tags: ['communication', 'lora', 'radio', 'spi', 'long-range', 'iot'],
};

export const LDR: ComponentDefinition = {
  id: 'ldr',
  name: 'LDR (Photoresistor)',
  category: 'sensor',
  description: 'Light-dependent resistor. Resistance decreases with increasing light intensity.',
  icon: 'ldr',
  svgComponentId: 'comp-ldr',
  width: 30,
  height: 40,
  pins: [
    { id: 'pin1', name: 'Pin 1', x: 15, y: 0, modes: ['input', 'output'], required: true },
    { id: 'pin2', name: 'Pin 2', x: 15, y: 40, modes: ['input', 'output'], required: true },
  ],
  properties: [
    {
      key: 'darkResistance',
      label: 'Dark Resistance (kΩ)',
      type: 'number',
      default: 1000,
      min: 10,
      max: 10000,
      step: 10,
      description: 'Resistance in complete darkness',
    },
    {
      key: 'lightResistance',
      label: 'Light Resistance (kΩ)',
      type: 'number',
      default: 1,
      min: 0.1,
      max: 50,
      step: 0.1,
      description: 'Resistance under bright light',
    },
  ],
  libraries: [],
  tags: ['sensor', 'light', 'analog', 'passive', 'environmental'],
};

export const PIR_SENSOR: ComponentDefinition = {
  id: 'pir-sensor',
  name: 'PIR Motion Sensor',
  category: 'sensor',
  description: 'Passive infrared sensor for detecting motion via infrared radiation changes.',
  icon: 'pir',
  svgComponentId: 'comp-pir',
  width: 40,
  height: 50,
  pins: [
    { id: 'vcc', name: 'VCC', x: 10, y: 0, modes: ['input'], required: true, description: 'Power supply (3.3–5V)' },
    { id: 'gnd', name: 'GND', x: 20, y: 0, modes: ['input'], required: true, description: 'Ground' },
    { id: 'out', name: 'OUT', x: 30, y: 0, modes: ['input', 'output'], required: true, description: 'Digital motion output (HIGH when motion detected)' },
  ],
  properties: [
    {
      key: 'sensitivity',
      label: 'Sensitivity',
      type: 'select',
      default: 'medium',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
      description: 'Detection sensitivity',
    },
    {
      key: 'holdTime',
      label: 'Hold Time (s)',
      type: 'number',
      default: 5,
      min: 1,
      max: 300,
      step: 1,
      description: 'Time output stays HIGH after last motion detection',
    },
  ],
  libraries: [],
  tags: ['sensor', 'motion', 'pir', 'digital', 'security'],
};

export const ROTARY_ENCODER: ComponentDefinition = {
  id: 'rotary-encoder',
  name: 'Rotary Encoder',
  category: 'input',
  description: 'Incremental rotary encoder with push button for position and click input.',
  icon: 'rotary-encoder',
  svgComponentId: 'comp-rotary-encoder',
  width: 50,
  height: 40,
  pins: [
    { id: 'clk', name: 'CLK', x: 0, y: 10, modes: ['input'], required: true, description: 'Clock signal (A channel)' },
    { id: 'dt', name: 'DT', x: 0, y: 20, modes: ['input'], required: true, description: 'Data signal (B channel)' },
    { id: 'sw', name: 'SW', x: 0, y: 30, modes: ['input', 'output'], required: true, description: 'Push button switch' },
  ],
  properties: [
    {
      key: 'stepsPerRevolution',
      label: 'Steps/Revolution',
      type: 'number',
      default: 20,
      min: 1,
      max: 360,
      step: 1,
      description: 'Number of detent positions per full rotation',
    },
    {
      key: 'hasPullup',
      label: 'Internal Pull-up',
      type: 'boolean',
      default: true,
      description: 'Whether the encoder has built-in pull-up resistors',
    },
  ],
  libraries: ['Encoder'],
  tags: ['input', 'encoder', 'rotary', 'position', 'button'],
};

export const COMPONENTS: ComponentDefinition[] = [
  LED,
  BUTTON,
  RESISTOR,
  POTENTIOMETER,
  DHT22,
  BME280,
  SSD1306_OLED,
  SERVO,
  RELAY,
  GPS_MODULE,
  MPU6050,
  BH1750,
  DS3231_RTC,
  SD_CARD_MODULE,
  LORA_MODULE,
  LDR,
  PIR_SENSOR,
  ROTARY_ENCODER,
];

export const COMPONENTS_BY_ID: Record<string, ComponentDefinition> = Object.fromEntries(
  COMPONENTS.map((c) => [c.id, c])
);

export const COMPONENTS_BY_CATEGORY: Record<string, ComponentDefinition[]> = {};
for (const comp of COMPONENTS) {
  if (!COMPONENTS_BY_CATEGORY[comp.category]) {
    COMPONENTS_BY_CATEGORY[comp.category] = [];
  }
  COMPONENTS_BY_CATEGORY[comp.category].push(comp);
}
