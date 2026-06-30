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
          { id: 'w1', sourceComponentId: 'board', sourcePinId: 'D13', targetComponentId: 'c1', targetPinId: 'anode', color: '#ff0000', segments: [] },
          { id: 'w2', sourceComponentId: 'board', sourcePinId: 'GND', targetComponentId: 'c1', targetPinId: 'cathode', color: '#000000', segments: [] },
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
          { id: 'c2', definitionId: 'dht22', x: 300, y: 250, rotation: 0, properties: {}, label: 'DHT22' },
        ],
        wires: [
          { id: 'w3', sourceComponentId: 'board', sourcePinId: '3V3', targetComponentId: 'c2', targetPinId: 'vcc', color: '#ff0000', segments: [] },
          { id: 'w4', sourceComponentId: 'board', sourcePinId: 'GND', targetComponentId: 'c2', targetPinId: 'gnd', color: '#000000', segments: [] },
          { id: 'w5', sourceComponentId: 'board', sourcePinId: 'GPIO4', targetComponentId: 'c2', targetPinId: 'data', color: '#ffff00', segments: [] },
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
          { id: 'w6', sourceComponentId: 'board', sourcePinId: 'D9', targetComponentId: 'c3', targetPinId: 'signal', color: '#ff8800', segments: [] },
          { id: 'w7', sourceComponentId: 'board', sourcePinId: '5V', targetComponentId: 'c3', targetPinId: 'vcc', color: '#ff0000', segments: [] },
          { id: 'w8', sourceComponentId: 'board', sourcePinId: 'GND', targetComponentId: 'c3', targetPinId: 'gnd', color: '#000000', segments: [] },
        ],
        libraries: [{ name: 'Servo', version: '1.2.1', source: 'official' }],
        tests: [],
        settings: { boardId: 'arduino-uno', clockSpeed: 16000000, voltage: 5, serialBaudRate: 9600 },
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
