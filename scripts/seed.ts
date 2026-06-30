import { client, generateId, hashPassword } from './_db';

async function seed() {
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

  const P = (p: string) => p.replace(/\\n/g, '\n');

  const projects = [
    {
      name: 'LED Blink',
      description: 'Classic Arduino LED blink example on pin 13',
      boardId: 'arduino-uno',
      file: 'led_blink.ino',
      content: P(`// LED Blink Example\nconst int ledPin = 13;\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n  Serial.begin(9600);\n  Serial.println("LED Blink started");\n}\nvoid loop() {\n  digitalWrite(ledPin, HIGH);\n  Serial.println("LED ON");\n  delay(1000);\n  digitalWrite(ledPin, LOW);\n  Serial.println("LED OFF");\n  delay(1000);\n}`),
      components: [{ id: 'c1', definitionId: 'led', x: 300, y: 200, rotation: 0, properties: { color: '#ff0000' }, label: 'Built-in LED' }],
      wires: [
        { id: 'w1', from: { componentId: 'board', pinId: 'D13' }, to: { componentId: 'c1', pinId: 'anode' }, color: '#ff0000' },
        { id: 'w2', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c1', pinId: 'cathode' }, color: '#000000' },
      ],
    },
    {
      name: 'DHT22 Weather Station',
      description: 'Read temperature and humidity from DHT22 on ESP32',
      boardId: 'esp32-devkit-v1',
      file: 'weather_station.ino',
      content: P(`// DHT22 Weather Station\n#include <DHT.h>\n#define DHT_PIN 4\n#define DHT_TYPE DHT22\nDHT dht(DHT_PIN, DHT_TYPE);\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n  Serial.println("DHT22 Weather Station");\n}\nvoid loop() {\n  float h = dht.readHumidity();\n  float t = dht.readTemperature();\n  if (isnan(h) || isnan(t)) { Serial.println("Sensor read failed!"); delay(2000); return; }\n  Serial.print("Temp: "); Serial.print(t);\n  Serial.print(" C  |  Humidity: "); Serial.print(h); Serial.println(" %");\n  delay(2000);\n}`),
      components: [{ id: 'c2', definitionId: 'dht22', x: 300, y: 250, rotation: 0, properties: { temperature: 24, humidity: 60 }, label: 'DHT22' }],
      wires: [
        { id: 'w3', from: { componentId: 'board', pinId: '3V3' }, to: { componentId: 'c2', pinId: 'vcc' }, color: '#ff0000' },
        { id: 'w4', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c2', pinId: 'gnd' }, color: '#000000' },
        { id: 'w5', from: { componentId: 'board', pinId: 'GPIO4' }, to: { componentId: 'c2', pinId: 'data' }, color: '#ffff00' },
      ],
    },
    {
      name: 'Servo Sweep',
      description: 'Sweep a servo motor back and forth from 0 to 180 degrees',
      boardId: 'arduino-uno',
      file: 'servo_sweep.ino',
      content: P(`// Servo Sweep\n#include <Servo.h>\nServo myServo;\nint pos = 0;\nvoid setup() { myServo.attach(9); Serial.begin(9600); }\nvoid loop() {\n  for (pos = 0; pos <= 180; pos++) { myServo.write(pos); delay(15); }\n  for (pos = 180; pos >= 0; pos--) { myServo.write(pos); delay(15); }\n}`),
      components: [{ id: 'c3', definitionId: 'servo', x: 300, y: 200, rotation: 0, properties: { angle: 90 }, label: 'Servo' }],
      wires: [
        { id: 'w6', from: { componentId: 'board', pinId: 'D9' }, to: { componentId: 'c3', pinId: 'signal' }, color: '#ff8800' },
        { id: 'w7', from: { componentId: 'board', pinId: '5V' }, to: { componentId: 'c3', pinId: 'vcc' }, color: '#ff0000' },
        { id: 'w8', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c3', pinId: 'gnd' }, color: '#000000' },
      ],
    },
    {
      name: 'Button Controlled LED',
      description: 'Turn an LED on while a push button is pressed (digital I/O)',
      boardId: 'arduino-uno',
      file: 'button_led.ino',
      content: P(`// Button Controlled LED\nconst int buttonPin = 2;\nconst int ledPin = 13;\nint buttonState = 0;\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n  pinMode(buttonPin, INPUT_PULLUP);\n  Serial.begin(9600);\n}\nvoid loop() {\n  buttonState = digitalRead(buttonPin);\n  if (buttonState == LOW) { digitalWrite(ledPin, HIGH); }\n  else { digitalWrite(ledPin, LOW); }\n  delay(100);\n}`),
      components: [
        { id: 'c4', definitionId: 'button', x: 220, y: 200, rotation: 0, properties: { pressed: false }, label: 'Push Button' },
        { id: 'c5', definitionId: 'led', x: 360, y: 200, rotation: 0, properties: { color: '#22c55e' }, label: 'LED' },
      ],
      wires: [
        { id: 'w9', from: { componentId: 'board', pinId: 'D2' }, to: { componentId: 'c4', pinId: 'pin1' }, color: '#3b82f6' },
        { id: 'w10', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c4', pinId: 'pin2' }, color: '#000000' },
        { id: 'w11', from: { componentId: 'board', pinId: 'D13' }, to: { componentId: 'c5', pinId: 'anode' }, color: '#22c55e' },
        { id: 'w12', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c5', pinId: 'cathode' }, color: '#000000' },
      ],
    },
    {
      name: 'Potentiometer Analog Read',
      description: 'Read a potentiometer wiper and print the ADC value (0-1023)',
      boardId: 'arduino-uno',
      file: 'potentiometer.ino',
      content: P(`// Potentiometer Analog Read\nconst int potPin = A0;\nint potValue = 0;\nvoid setup() { Serial.begin(9600); }\nvoid loop() {\n  potValue = analogRead(potPin);\n  Serial.print("Pot value: "); Serial.println(potValue);\n  delay(300);\n}`),
      components: [{ id: 'c6', definitionId: 'potentiometer', x: 300, y: 220, rotation: 0, properties: { position: 0.5 }, label: 'Potentiometer' }],
      wires: [
        { id: 'w13', from: { componentId: 'board', pinId: '5V' }, to: { componentId: 'c6', pinId: 'vcc' }, color: '#ff0000' },
        { id: 'w14', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c6', pinId: 'gnd' }, color: '#000000' },
        { id: 'w15', from: { componentId: 'board', pinId: 'A0' }, to: { componentId: 'c6', pinId: 'wiper' }, color: '#eab308' },
      ],
    },
    {
      name: 'Servo Knob',
      description: 'Control a servo angle with a potentiometer',
      boardId: 'arduino-uno',
      file: 'servo_knob.ino',
      content: P(`// Servo Knob\n#include <Servo.h>\nServo myServo;\nconst int potPin = A0;\nint val = 0;\nvoid setup() { myServo.attach(9); Serial.begin(9600); }\nvoid loop() {\n  val = analogRead(potPin);\n  val = map(val, 0, 1023, 0, 180);\n  myServo.write(val);\n  Serial.print("Angle: "); Serial.println(val);\n  delay(15);\n}`),
      components: [
        { id: 'c7', definitionId: 'potentiometer', x: 220, y: 220, rotation: 0, properties: { position: 0.5 }, label: 'Potentiometer' },
        { id: 'c8', definitionId: 'servo', x: 400, y: 220, rotation: 0, properties: { angle: 90 }, label: 'Servo' },
      ],
      wires: [
        { id: 'w16', from: { componentId: 'board', pinId: '5V' }, to: { componentId: 'c7', pinId: 'vcc' }, color: '#ff0000' },
        { id: 'w17', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c7', pinId: 'gnd' }, color: '#000000' },
        { id: 'w18', from: { componentId: 'board', pinId: 'A0' }, to: { componentId: 'c7', pinId: 'wiper' }, color: '#eab308' },
        { id: 'w19', from: { componentId: 'board', pinId: 'D9' }, to: { componentId: 'c8', pinId: 'signal' }, color: '#f97316' },
        { id: 'w20', from: { componentId: 'board', pinId: '5V' }, to: { componentId: 'c8', pinId: 'vcc' }, color: '#ff0000' },
        { id: 'w21', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'c8', pinId: 'gnd' }, color: '#000000' },
      ],
    },
    {
      name: 'BME280 Environment Monitor',
      description: 'Read temperature & humidity from a BME280 over I2C (ESP32)',
      boardId: 'esp32-devkit-v1',
      file: 'bme280_monitor.ino',
      content: P(`// BME280 Environment Monitor\n#include <Wire.h>\n#define BME_ADDR 0x76\nvoid setup() { Serial.begin(115200); Wire.begin(); Serial.println("BME280 Monitor"); }\nvoid loop() {\n  Wire.beginTransmission(BME_ADDR); Wire.write(0xFA); Wire.endTransmission();\n  Wire.requestFrom(BME_ADDR, 1); int tempRaw = Wire.read();\n  Wire.beginTransmission(BME_ADDR); Wire.write(0xFD); Wire.endTransmission();\n  Wire.requestFrom(BME_ADDR, 1); int humRaw = Wire.read();\n  Serial.print("Temp: "); Serial.print(tempRaw);\n  Serial.print(" C  |  Hum: "); Serial.print(humRaw); Serial.println(" %");\n  delay(2000);\n}`),
      components: [{ id: 'bme280', definitionId: 'bme280', x: 300, y: 250, rotation: 0, properties: { temperature: 25, humidity: 50, pressure: 1013 }, label: 'BME280' }],
      wires: [
        { id: 'w22', from: { componentId: 'board', pinId: '3V3' }, to: { componentId: 'bme280', pinId: 'vcc' }, color: '#ff0000' },
        { id: 'w23', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'bme280', pinId: 'gnd' }, color: '#000000' },
        { id: 'w24', from: { componentId: 'board', pinId: 'GPIO22' }, to: { componentId: 'bme280', pinId: 'scl' }, color: '#eab308' },
        { id: 'w25', from: { componentId: 'board', pinId: 'GPIO21' }, to: { componentId: 'bme280', pinId: 'sda' }, color: '#3b82f6' },
      ],
    },
    {
      name: 'OLED Hello World',
      description: 'Write text to a 0.96" SSD1306 OLED over I2C (ESP32)',
      boardId: 'esp32-devkit-v1',
      file: 'oled_hello.ino',
      content: P(`// OLED Hello World\n#include <Wire.h>\n#define OLED_ADDR 0x3C\nvoid setup() { Wire.begin(); Serial.begin(115200); Serial.println("OLED ready"); }\nvoid loop() {\n  Wire.beginTransmission(OLED_ADDR);\n  Wire.write(72); Wire.write(101); Wire.write(108); Wire.write(108); Wire.write(111);\n  Wire.endTransmission();\n  Serial.println("Sent: Hello");\n  delay(2000);\n}`),
      components: [{ id: 'oled', definitionId: 'ssd1306', x: 300, y: 240, rotation: 0, properties: {}, label: 'OLED SSD1306' }],
      wires: [
        { id: 'w26', from: { componentId: 'board', pinId: '3V3' }, to: { componentId: 'oled', pinId: 'vcc' }, color: '#ff0000' },
        { id: 'w27', from: { componentId: 'board', pinId: 'GND' }, to: { componentId: 'oled', pinId: 'gnd' }, color: '#000000' },
        { id: 'w28', from: { componentId: 'board', pinId: 'GPIO22' }, to: { componentId: 'oled', pinId: 'scl' }, color: '#eab308' },
        { id: 'w29', from: { componentId: 'board', pinId: 'GPIO21' }, to: { componentId: 'oled', pinId: 'sda' }, color: '#3b82f6' },
      ],
    },
  ];

  for (const proj of projects) {
    const projId = generateId();
    const data = JSON.stringify({
      files: [{
        id: generateId(),
        name: proj.file,
        content: proj.content,
        language: 'ino',
        isMain: true,
        isOpen: true,
        isDirty: false,
        createdAt: now,
        updatedAt: now,
      }],
      components: proj.components,
      wires: proj.wires.map((w) => ({ ...w, points: [{ x: 0, y: 0 }, { x: 0, y: 0 }] })),
      libraries: [],
      tests: [],
      settings: {
        boardId: proj.boardId,
        clockSpeed: proj.boardId === 'esp32-devkit-v1' ? 240000000 : 16000000,
        voltage: proj.boardId === 'esp32-devkit-v1' ? 3.3 : 5,
        serialBaudRate: 115200,
      },
    });
    await client.execute({
      sql: `INSERT INTO projects (id, user_id, name, description, board_id, data, created_at, updated_at, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      args: [projId, userId, proj.name, proj.description, proj.boardId, data, now, now],
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
