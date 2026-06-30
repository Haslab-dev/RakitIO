import { createClient } from '@libsql/client';

const TURSO_URL = process.env.TURSO_DATABASE_URL!;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN!;

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
}

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function seed() {
  const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

  const demoEmail = 'demo@rakit.io';
  const demoPassword = 'demo1234';
  const demoName = 'Demo User';

  const existing = await client.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [demoEmail],
  });

  if (existing.rows.length > 0) {
    console.log('Demo user already exists, skipping seed.');
    return;
  }

  const userId = generateId();
  const passwordHash = await hashPassword(demoPassword);
  const now = new Date().toISOString();

  await client.execute({
    sql: `INSERT INTO users (id, email, name, password_hash, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [userId, demoEmail, demoName, passwordHash, null, now, now],
  });
  console.log(`Created demo user: ${demoEmail}`);

  const projects = [
    {
      name: 'LED Blink',
      description: 'Classic Arduino LED blink example on pin 13',
      boardId: 'arduino-uno',
      data: JSON.stringify({
        files: [
          {
            id: 'f1',
            name: 'led_blink.ino',
            content: `// LED Blink Example\n// Built with RakitIO\n\nconst int ledPin = 13;\n\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n  Serial.begin(9600);\n  Serial.println("LED Blink started");\n}\n\nvoid loop() {\n  digitalWrite(ledPin, HIGH);\n  Serial.println("LED ON");\n  delay(1000);\n\n  digitalWrite(ledPin, LOW);\n  Serial.println("LED OFF");\n  delay(1000);\n}`,
            language: 'ino',
            isMain: true,
            isOpen: true,
            isDirty: false,
            createdAt: now,
            updatedAt: now,
          },
        ],
        components: [
          { id: 'c1', definitionId: 'led', x: 300, y: 200, rotation: 0, properties: { color: '#ff0000' }, label: 'Built-in LED' },
        ],
        wires: [
          { id: 'w1', from: { componentId: 'board', pinId: 'D13' }, to: { componentId: 'c1', pinId: 'anode' }, color: '#ff0000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w2', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c1', pinId: 'cathode' }, color: '#000000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
        ],
        libraries: [],
        tests: [],
        settings: { boardId: 'arduino-uno', clockSpeed: 16000000, voltage: 5, serialBaudRate: 9600 },
      }),
    },
    {
      name: 'DHT22 Weather Station',
      description: 'Read temperature and humidity from DHT22 sensor on ESP32',
      boardId: 'esp32-devkit-v1',
      data: JSON.stringify({
        files: [
          {
            id: 'f2',
            name: 'weather_station.ino',
            content: `// DHT22 Weather Station\n// Built with RakitIO\n\n#include <DHT.h>\n\n#define DHT_PIN 4\n#define DHT_TYPE DHT22\n\nDHT dht(DHT_PIN, DHT_TYPE);\n\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n  Serial.println("DHT22 Weather Station");\n}\n\nvoid loop() {\n  float h = dht.readHumidity();\n  float t = dht.readTemperature();\n\n  if (isnan(h) || isnan(t)) {\n    Serial.println("Sensor read failed!");\n    delay(2000);\n    return;\n  }\n\n  Serial.print("Temp: ");\n  Serial.print(t);\n  Serial.print(" C  |  Humidity: ");\n  Serial.print(h);\n  Serial.println(" %");\n\n  delay(2000);\n}`,
            language: 'ino',
            isMain: true,
            isOpen: true,
            isDirty: false,
            createdAt: now,
            updatedAt: now,
          },
        ],
        components: [
          { id: 'c2', definitionId: 'dht22', x: 300, y: 250, rotation: 0, properties: { temperature: 24, humidity: 60 }, label: 'DHT22' },
        ],
        wires: [
          { id: 'w3', from: { componentId: 'board', pinId: '3V3' }, to: { componentId: 'c2', pinId: 'vcc' }, color: '#ff0000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w4', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c2', pinId: 'gnd' }, color: '#000000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w5', from: { componentId: 'board', pinId: 'GPIO4' }, to: { componentId: 'c2', pinId: 'data' }, color: '#ffff00', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
        ],
        libraries: [{ name: 'DHT', version: '1.4.4', source: 'official' }],
        tests: [],
        settings: { boardId: 'esp32-devkit-v1', clockSpeed: 240000000, voltage: 3.3, serialBaudRate: 115200 },
      }),
    },
    {
      name: 'Servo Sweep',
      description: 'Sweep a servo motor back and forth from 0 to 180 degrees',
      boardId: 'arduino-uno',
      data: JSON.stringify({
        files: [
          {
            id: 'f3',
            name: 'servo_sweep.ino',
            content: `// Servo Sweep\n// Built with RakitIO\n\n#include <Servo.h>\n\nServo myServo;\nint pos = 0;\n\nvoid setup() {\n  myServo.attach(9);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  for (pos = 0; pos <= 180; pos++) {\n    myServo.write(pos);\n    delay(15);\n  }\n  for (pos = 180; pos >= 0; pos--) {\n    myServo.write(pos);\n    delay(15);\n  }\n}`,
            language: 'ino',
            isMain: true,
            isOpen: true,
            isDirty: false,
            createdAt: now,
            updatedAt: now,
          },
        ],
        components: [
          { id: 'c3', definitionId: 'servo', x: 300, y: 200, rotation: 0, properties: { angle: 90 }, label: 'Servo' },
        ],
        wires: [
          { id: 'w6', from: { componentId: 'board', pinId: 'D9' }, to: { componentId: 'c3', pinId: 'signal' }, color: '#ff8800', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w7', from: { componentId: 'board', pinId: '5V' }, to: { componentId: 'c3', pinId: 'vcc' }, color: '#ff0000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w8', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c3', pinId: 'gnd' }, color: '#000000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
        ],
        libraries: [{ name: 'Servo', version: '1.2.1', source: 'official' }],
        tests: [],
        settings: { boardId: 'arduino-uno', clockSpeed: 16000000, voltage: 5, serialBaudRate: 9600 },
      }),
    },
    {
      name: 'Button Controlled LED',
      description: 'Turn an LED on while a push button is pressed (digital I/O)',
      boardId: 'arduino-uno',
      data: JSON.stringify({
        files: [
          {
            id: 'f4',
            name: 'button_led.ino',
            content: `// Button Controlled LED\n// Built with RakitIO\n\nconst int buttonPin = 2;\nconst int ledPin = 13;\nint buttonState = 0;\n\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n  pinMode(buttonPin, INPUT_PULLUP);\n  Serial.begin(9600);\n  Serial.println("Press the button!");\n}\n\nvoid loop() {\n  buttonState = digitalRead(buttonPin);\n\n  if (buttonState == LOW) {\n    digitalWrite(ledPin, HIGH);\n    Serial.println("Pressed - LED ON");\n  } else {\n    digitalWrite(ledPin, LOW);\n  }\n\n  delay(100);\n}`,
            language: 'ino',
            isMain: true,
            isOpen: true,
            isDirty: false,
            createdAt: now,
            updatedAt: now,
          },
        ],
        components: [
          { id: 'c4', definitionId: 'button', x: 220, y: 200, rotation: 0, properties: { pressed: false }, label: 'Push Button' },
          { id: 'c5', definitionId: 'led', x: 360, y: 200, rotation: 0, properties: { color: '#22c55e' }, label: 'LED' },
        ],
        wires: [
          { id: 'w9', from: { componentId: 'board', pinId: 'D2' }, to: { componentId: 'c4', pinId: 'pin1' }, color: '#3b82f6', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w10', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c4', pinId: 'pin2' }, color: '#000000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w11', from: { componentId: 'board', pinId: 'D13' }, to: { componentId: 'c5', pinId: 'anode' }, color: '#22c55e', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w12', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c5', pinId: 'cathode' }, color: '#000000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
        ],
        libraries: [],
        tests: [],
        settings: { boardId: 'arduino-uno', clockSpeed: 16000000, voltage: 5, serialBaudRate: 9600 },
      }),
    },
    {
      name: 'Potentiometer Analog Read',
      description: 'Read a potentiometer wiper and print the ADC value (0-1023)',
      boardId: 'arduino-uno',
      data: JSON.stringify({
        files: [
          {
            id: 'f5',
            name: 'potentiometer.ino',
            content: `// Potentiometer Analog Read\n// Built with RakitIO\n\nconst int potPin = A0;\nint potValue = 0;\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  potValue = analogRead(potPin);\n  Serial.print("Pot value: ");\n  Serial.println(potValue);\n  delay(300);\n}`,
            language: 'ino',
            isMain: true,
            isOpen: true,
            isDirty: false,
            createdAt: now,
            updatedAt: now,
          },
        ],
        components: [
          { id: 'c6', definitionId: 'potentiometer', x: 300, y: 220, rotation: 0, properties: { position: 0.5 }, label: 'Potentiometer' },
        ],
        wires: [
          { id: 'w13', from: { componentId: 'board', pinId: '5V' }, to: { componentId: 'c6', pinId: 'vcc' }, color: '#ff0000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w14', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c6', pinId: 'gnd' }, color: '#000000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w15', from: { componentId: 'board', pinId: 'A0' }, to: { componentId: 'c6', pinId: 'wiper' }, color: '#eab308', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
        ],
        libraries: [],
        tests: [],
        settings: { boardId: 'arduino-uno', clockSpeed: 16000000, voltage: 5, serialBaudRate: 9600 },
      }),
    },
    {
      name: 'Servo Knob',
      description: 'Control a servo angle with a potentiometer (analog input → PWM output)',
      boardId: 'arduino-uno',
      data: JSON.stringify({
        files: [
          {
            id: 'f6',
            name: 'servo_knob.ino',
            content: `// Servo Knob\n// Built with RakitIO\n\n#include <Servo.h>\n\nServo myServo;\nconst int potPin = A0;\nint val = 0;\n\nvoid setup() {\n  myServo.attach(9);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  val = analogRead(potPin);\n  val = map(val, 0, 1023, 0, 180);\n  myServo.write(val);\n  Serial.print("Angle: ");\n  Serial.println(val);\n  delay(15);\n}`,
            language: 'ino',
            isMain: true,
            isOpen: true,
            isDirty: false,
            createdAt: now,
            updatedAt: now,
          },
        ],
        components: [
          { id: 'c7', definitionId: 'potentiometer', x: 220, y: 220, rotation: 0, properties: { position: 0.5 }, label: 'Potentiometer' },
          { id: 'c8', definitionId: 'servo', x: 400, y: 220, rotation: 0, properties: { angle: 90 }, label: 'Servo' },
        ],
        wires: [
          { id: 'w16', from: { componentId: 'board', pinId: '5V' }, to: { componentId: 'c7', pinId: 'vcc' }, color: '#ff0000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w17', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c7', pinId: 'gnd' }, color: '#000000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w18', from: { componentId: 'board', pinId: 'A0' }, to: { componentId: 'c7', pinId: 'wiper' }, color: '#eab308', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w19', from: { componentId: 'board', pinId: 'D9' }, to: { componentId: 'c8', pinId: 'signal' }, color: '#f97316', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w20', from: { componentId: 'board', pinId: '5V' }, to: { componentId: 'c8', pinId: 'vcc' }, color: '#ff0000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w21', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c8', pinId: 'gnd' }, color: '#000000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
        ],
        libraries: [{ name: 'Servo', version: '1.2.1', source: 'official' }],
        tests: [],
        settings: { boardId: 'arduino-uno', clockSpeed: 16000000, voltage: 5, serialBaudRate: 9600 },
      }),
    },
    {
      name: 'BME280 Environment Monitor',
      description: 'Read temperature, humidity & pressure from a BME280 over I2C (ESP32)',
      boardId: 'esp32-devkit-v1',
      data: JSON.stringify({
        files: [
          {
            id: 'f7',
            name: 'bme280_monitor.ino',
            content: `// BME280 Environment Monitor\n// Built with RakitIO\n\n#include <Wire.h>\n\n#define BME_ADDR 0x76\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  Serial.println("BME280 Monitor");\n}\n\nvoid loop() {\n  // Read temperature register 0xFA\n  Wire.beginTransmission(BME_ADDR);\n  Wire.write(0xFA);\n  Wire.endTransmission();\n  Wire.requestFrom(BME_ADDR, 1);\n  int tempRaw = Wire.read();\n\n  // Read humidity register 0xFD\n  Wire.beginTransmission(BME_ADDR);\n  Wire.write(0xFD);\n  Wire.endTransmission();\n  Wire.requestFrom(BME_ADDR, 1);\n  int humRaw = Wire.read();\n\n  Serial.print("Temp: ");\n  Serial.print(tempRaw);\n  Serial.print(" C  |  Hum: ");\n  Serial.print(humRaw);\n  Serial.println(" %");\n\n  delay(2000);\n}`,
            language: 'ino',
            isMain: true,
            isOpen: true,
            isDirty: false,
            createdAt: now,
            updatedAt: now,
          },
        ],
        components: [
          { id: 'bme280', definitionId: 'bme280', x: 300, y: 250, rotation: 0, properties: { temperature: 25, humidity: 50, pressure: 1013 }, label: 'BME280' },
        ],
        wires: [
          { id: 'w22', from: { componentId: 'board', pinId: '3V3' }, to: { componentId: 'bme280', pinId: 'vcc' }, color: '#ff0000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w23', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'bme280', pinId: 'gnd' }, color: '#000000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w24', from: { componentId: 'board', pinId: 'GPIO22' }, to: { componentId: 'bme280', pinId: 'scl' }, color: '#eab308', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w25', from: { componentId: 'board', pinId: 'GPIO21' }, to: { componentId: 'bme280', pinId: 'sda' }, color: '#3b82f6', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
        ],
        libraries: [{ name: 'Wire', version: '1.0', source: 'official' }],
        tests: [],
        settings: { boardId: 'esp32-devkit-v1', clockSpeed: 240000000, voltage: 3.3, serialBaudRate: 115200 },
      }),
    },
    {
      name: 'OLED Hello World',
      description: 'Write text to a 0.96" SSD1306 OLED display over I2C (ESP32)',
      boardId: 'esp32-devkit-v1',
      data: JSON.stringify({
        files: [
          {
            id: 'f8',
            name: 'oled_hello.ino',
            content: `// OLED Hello World\n// Built with RakitIO\n\n#include <Wire.h>\n\n#define OLED_ADDR 0x3C\n\nvoid setup() {\n  Wire.begin();\n  Serial.begin(115200);\n  Serial.println("OLED ready");\n}\n\nvoid loop() {\n  Wire.beginTransmission(OLED_ADDR);\n  Wire.write(72);   // H\n  Wire.write(101);  // e\n  Wire.write(108);  // l\n  Wire.write(108);  // l\n  Wire.write(111);  // o\n  Wire.endTransmission();\n  Serial.println("Sent: Hello");\n  delay(2000);\n}`,
            language: 'ino',
            isMain: true,
            isOpen: true,
            isDirty: false,
            createdAt: now,
            updatedAt: now,
          },
        ],
        components: [
          { id: 'oled', definitionId: 'ssd1306', x: 300, y: 240, rotation: 0, properties: {}, label: 'OLED SSD1306' },
        ],
        wires: [
          { id: 'w26', from: { componentId: 'board', pinId: '3V3' }, to: { componentId: 'oled', pinId: 'vcc' }, color: '#ff0000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w27', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'oled', pinId: 'gnd' }, color: '#000000', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w28', from: { componentId: 'board', pinId: 'GPIO22' }, to: { componentId: 'oled', pinId: 'scl' }, color: '#eab308', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
          { id: 'w29', from: { componentId: 'board', pinId: 'GPIO21' }, to: { componentId: 'oled', pinId: 'sda' }, color: '#3b82f6', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] },
        ],
        libraries: [{ name: 'Wire', version: '1.0', source: 'official' }],
        tests: [],
        settings: { boardId: 'esp32-devkit-v1', clockSpeed: 240000000, voltage: 3.3, serialBaudRate: 115200 },
      }),
    },
  ];

  for (const proj of projects) {
    const projId = generateId();
    await client.execute({
      sql: `INSERT INTO projects (id, user_id, name, description, board_id, data, created_at, updated_at, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      args: [projId, userId, proj.name, proj.description, proj.boardId, proj.data, now, now],
    });
    console.log(`  Created project: ${proj.name}`);
  }

  console.log(`\nSeed complete!`);
  console.log(`  Email:    ${demoEmail}`);
  console.log(`  Password: ${demoPassword}`);
  console.log(`  Projects: ${projects.length}`);
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
