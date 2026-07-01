I actually like the direction. The layout already resembles VS Code + Wokwi, which is familiar. But if your ambition is to compete with Wokwi rather than imitate it, I'd change a few architectural decisions now before they become expensive to refactor.

---

# RFC-0002 — Rakit Simulation Engine & Device Rendering

## Status

Draft

---

# Goals

* Browser-native simulation
* Arduino-compatible generated code
* Extensible device SDK
* Accurate SVG representations
* Realistic wiring playground
* AI-aware project graph
* Cloudflare Pages compatible (no native runtime)

---

# 1. Execution Architecture

Instead of:

```text
Arduino Code
    ↓
JavaScript
```

Use:

```text
Arduino (.ino)

↓

Parser

↓

AST

↓

Rakit IR

↓

Interpreter

↓

Simulation Runtime

↓

GPIO
I2C
SPI
UART
```

Every instruction becomes an IR node.

Example:

```cpp
digitalWrite(13, HIGH);
```

↓

```json
{
  "type":"Call",
  "fn":"digitalWrite",
  "args":[13,true]
}
```

The runtime executes the IR.

Advantages:

* AI can modify IR.
* Debugger.
* Variable inspection.
* Time-travel debugging.
* Breakpoints.

---

# 2. Simulation Scheduler

Everything should be event-driven.

```text
Scheduler

├── loop()

├── delay()

├── millis()

├── micros()

├── Timers

├── Interrupt Queue

└── Device Tick()
```

Every device receives

```ts
tick(deltaTime)
```

every frame.

---

# 3. Runtime

```text
Runtime

GPIO Bus

I2C Bus

SPI Bus

UART Bus

ADC

PWM

Filesystem

Network

Power
```

Devices never talk directly.

Instead

```text
OLED

↓

I2C

↓

Runtime

↓

ESP32
```

This makes every device reusable.

---

# 4. Device SDK

Current:

```
SVG
logic
```

I'd expand.

```text
module/

module.json

logic.ts

render.tsx

pins.ts

properties.ts

simulator.ts

ai.md

documentation.md
```

---

Example

```ts
export default {

id:"bme280",

protocol:"i2c",

address:[0x76,0x77],

pins:[
"SDA",
"SCL",
"VCC",
"GND"
],

properties:{
temperature:25,
humidity:70
}

}
```

---

# 5. SVG Accuracy

This is the biggest thing I'd improve.

Current screenshot feels like flat icons pasted on a canvas.

Wokwi feels realistic because every module is almost a PCB.

I'd define SVG rules.

---

## Level 1

Simple icon

❌ Don't use.

---

## Level 2

PCB outline

Silkscreen

Headers

Pins

Labels

Mount holes

Much better.

---

## Level 3 (Recommended)

Photorealistic vector.

Example:

ESP32

```
USB

EN Button

Boot Button

PCB Texture

Silkscreen

Pin Numbers

Pin Labels

Chip

RF Shield

LED

Mount Holes
```

Same for

BME280

OLED

MPU6050

LoRa

etc.

---

# Recommendation

Every module should be traced from the real PCB.

Not redrawn.

Import SVG from

KiCad

EasyEDA

Manufacturer CAD

then optimize.

That instantly makes Rakit look professional.

---

# 6. Pins

Pins shouldn't be circles.

They should have metadata.

```ts
Pin {

id

name

label

bus

position

rotation

voltage

}
```

Hover

↓

```
GPIO21

I2C SDA

3.3V
```

---

# 7. Wiring

Instead of

```
wire.start

wire.end
```

Use

```text
Net

↓

Pin

↓

Pin

↓

Pin

↓

Pin
```

Exactly like KiCad.

Example

```
Net SDA

↓

ESP32 GPIO21

↓

OLED SDA

↓

BME280 SDA

↓

RTC SDA
```

Then

AI

Validation

Simulation

all operate on the Net.

---

# 8. Rendering

```
Canvas

↓

Viewport

↓

Layers

Board

Breadboard

Components

Pins

Wires

Selection

Debug
```

Every layer independent.

---

# 9. SVG Rendering

I'd move away from React components.

Instead

```
SVG

↓

Virtual Scene Graph

↓

Renderer
```

React shouldn't rerender hundreds of wires.

---

# 10. Simulator State

```ts
Project

↓

Graph

↓

Runtime

↓

State

↓

Renderer
```

Never mutate SVG directly.

Renderer only reflects state.

---

# 11. Running Simulation

Instead of

```
Run

↓

while(true)

loop()
```

Use

```
Start

↓

Scheduler

↓

setup()

↓

Frame

↓

Device Tick()

↓

loop()

↓

Render

↓

Next Frame
```

So

```
LED

↓

state changed

↓

Renderer updates LED only
```

---

# 12. Device Library

I'd target about **40 modules** for v1.

### Boards

* Arduino Uno
* Nano
* Mega
* ESP32 DevKit V1
* ESP8266
* Raspberry Pi Pico

---

### Passive

* Breadboard
* Resistor
* Capacitor
* Potentiometer
* Diode
* LED
* RGB LED

---

### GPIO

* Relay
* Servo
* Stepper
* Motor Driver
* PIR
* Button
* Encoder

---

### I²C

* SSD1306
* BME280
* BMP280
* MPU6050
* BH1750
* INA219
* ADS1115
* DS3231

---

### UART

* GPS
* GSM
* Fingerprint

---

### SPI

* SD Card
* TFT
* LoRa
* nRF24

---

### Misc

* Ultrasonic
* DHT22
* DS18B20
* Buzzer

---

# My biggest recommendation

The screenshot shows components as **individual floating widgets**. That works, but it doesn't yet feel like electronics design software.

I would introduce a proper **Workbench**:

```text
Workbench
│
├── Arduino / ESP32 Board
├── Breadboard
├── Components
├── Wires
├── Power Rails
└── Measurement Tools
```

Components should snap to breadboard holes and board headers. Wires should terminate on actual pin pads, not generic circles. Add subtle shadows, silkscreen text, mounting holes, and connector details so the SVGs resemble real hardware. Those visual improvements, combined with net-based wiring and an event-driven simulation engine, will make Rakit feel like a genuine embedded development environment rather than a generic diagram editor.
