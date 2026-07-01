Excellent choice. **RakitIO** is short, memorable, and naturally conveys the idea of building electronics. It also works well internationally ("rah-keet") while retaining its Indonesian identity.

I'd define the product as:

> **RakitIO — AI-Native Embedded Development Platform**

---

# RFC-0001 — RakitIO Platform Architecture

## Vision

RakitIO is an AI-native browser platform for designing, programming, wiring, simulating, and deploying embedded systems.

Unlike traditional simulators, RakitIO treats **AI as the primary interface**, allowing users to describe a project in natural language and receive a complete working solution, including circuit design, Arduino code, documentation, and interactive simulation.

Primary goals:

* Browser-only experience
* Deployable on Cloudflare Pages + Workers
* Real Arduino-compatible code
* Visual wiring playground
* Extensible module ecosystem
* AI-first workflow

---

# Core Principles

## 1. AI First

Users can start by typing:

> Build a smart greenhouse using ESP32 and BME280.

RakitIO generates:

* Project
* Board
* Components
* Wiring
* Arduino code
* Documentation
* Simulation scenario

---

## 2. Browser Native

No Docker.

No server-side simulator.

No backend service.

Simulation runs entirely inside the browser.

> **Architecture decision (2026):** RakitIO is a **client-only** single-page
> application. There is no server/Worker. The browser talks to the database
> (Turso/libSQL over HTTP) directly and calls AI providers directly. See
> "Data & Persistence" and "Security Tradeoffs" below.

---

## 3. Arduino Compatible

Generated code should compile inside Arduino IDE.

Avoid proprietary APIs.

Prefer official Arduino libraries.

---

## 4. Extensible

Everything is a plugin.

Boards.

Sensors.

Displays.

Protocols.

AI knowledge.

---

# Technology Stack

## Frontend

* React 19
* React Router v8
* TypeScript
* Vite
* TailwindCSS
* Zustand
* TanStack Query
* Monaco Editor
* SVG Renderer (custom)
* Web Workers
* Framer Motion

---

## Data & Persistence (client-only)

The app has **no server**. Everything runs in the browser.

* **Database:** Turso (libSQL) accessed directly from the browser via
  `@libsql/client` (HTTP transport) and Drizzle ORM. Credentials are read from
  `VITE_TURSO_URL` / `VITE_TURSO_AUTH_TOKEN` and bundled into the client.
* **Auth:** Login/registration is performed client-side. Passwords are hashed
  with Web Crypto (SHA-256) and the user record + sessions live in Turso. The
  active session is persisted in `localStorage`.
* **Schema migration / seed:** Plain scripts under `scripts/`
  (`migrate.ts`, `seed.ts`) run under bun against the same Turso DB.

### Security Tradeoffs (accepted)

Because there is no backend:

1. **The Turso auth token is exposed to anyone who opens the app.** All users
   share the token, so ownership is enforced **at the application layer only**
   (queries filter by `userId`), not by the database. Use a token with the
   minimum required permissions.
2. **AI keys are bring-your-own-key.** Users configure their own OpenAI /
   Anthropic / OpenRouter key in Settings (stored in Turso / `localStorage`).
   There is no server-side proxy to keep keys secret.
3. **Password hashing is unsalted SHA-256** (matches the prior server scheme)
   and happens in the browser. This is weak; it is acceptable for an
   educational/local tool but not for sensitive data.

If stronger isolation or secret protection is ever required, reintroduce a
thin serverless function (Cloudflare/Pages) as a DB and/or AI proxy.

---

## AI

Provider abstraction.

Supports:

* OpenAI
* Anthropic
* Gemini
* OpenRouter
* Local models (future)

---

# Project Structure

A single client-only application at the repository root (no monorepo, no
service).

```text
/                               # Client-only app (Vite + React)
    src/
        lib/
            db/                 # Drizzle schema + libSQL (Turso) browser client
            svg/                # SVG rendering engine
            simulator/          # Browser-side simulation engine + worker bridge
            types/              # TypeScript types
            hooks/              # React hooks
            stores/             # Zustand stores
            api.ts              # Data + AI access layer (talks to Turso / providers directly)
        components/             # UI components
        pages/                  # React Router pages
        workers/                # Web Workers for simulation
    scripts/
        migrate.ts              # Idempotent schema creation (bun)
        seed.ts                 # Demo user + example projects (bun)
    spec/                       # RFCs
```

---

# Architecture

```text
React (browser SPA)

├── Monaco Editor
├── AI Chat Panel  ──────────────► AI Provider (bring-your-own-key, direct fetch)
├── Project Explorer
├── Wiring Playground (SVG Canvas)
├── Component Library
├── Serial Monitor
├── Device Inspector
└── Simulation Web Worker

↓ @libsql/client (HTTP)  +  Drizzle ORM

Turso (libSQL / SQLite)
```

---

# Simulation Engine

Subsystems

```text
Scheduler

GPIO

ADC

PWM

UART

I2C

SPI

OneWire

CAN

RS485

Filesystem

WiFi

BLE

Power

Clock
```

---

# Device SDK

Every module:

```text
module.json

logic.ts

renderer.tsx

properties.ts

icon.svg

documentation.md
```

---

# SVG Engine

Everything rendered as SVG.

Examples:

* Arduino Uno
* ESP32 DevKit
* Breadboard
* LEDs
* OLED
* Relay
* Servo
* LoRa
* GPS
* DHT22
* MPU6050

Pins remain interactive.

---

# Wiring Playground

Features

✅ Drag & Drop

✅ Wire routing

✅ Pin snapping

✅ Pin highlighting

✅ Net validation

✅ Undo/Redo

✅ Zoom

✅ Pan

✅ AI Auto Wire

Future

* PCB View
* PCB Export
* KiCad Export

---

# Supported Boards (Phase 1)

Arduino

* Uno
* Nano
* Mega

ESP

* ESP32 DevKit V1
* ESP8266 NodeMCU

RP2040

* Raspberry Pi Pico

---

# Supported Interfaces

## GPIO

* LED
* Button
* Relay
* PIR
* Servo
* Encoder

---

## ADC

* Potentiometer
* LDR
* Joystick
* Soil Moisture

---

## PWM

* Servo
* Motor

---

## UART

* GPS
* GSM
* Fingerprint

---

## SPI

* SD Card
* TFT
* LoRa

---

## I²C

Phase 1

* SSD1306
* BME280
* BMP280
* MPU6050
* BH1750
* DS3231

Phase 2

50+ sensors

Phase 3

100+ sensors

---

## WiFi

Virtual

* HTTP
* HTTPS
* MQTT
* WebSocket
* OTA
* NTP

---

## BLE

Virtual Central

Virtual Peripheral

---

# AI Features

## Generate Project

Natural language →

Complete project

---

## Explain Code

---

## Fix Wiring

---

## Detect Errors

Example

> SDA connected to GPIO17.

AI:

> ESP32 default SDA is GPIO21.

---

## Generate Test Cases

Example

```text
Temperature = 30°C

↓

LED turns on
```

---

## Documentation

Automatic README

---

## Convert

* Uno → ESP32
* ESP32 → Pico

---

# Project Structure

```text
Project

Board

Components

Wires

Arduino Code

Libraries

Simulation

Tests

AI Context

Assets
```

---

# Export

Supported

* Arduino ZIP
* .ino
* PDF Documentation
* Wiring Diagram (SVG)
* JSON Project

Future

* KiCad
* PlatformIO

---

# MVP Roadmap

## Phase 1 — Foundation

Duration: ~6–8 weeks

* Authentication
* Projects
* Monaco
* AI Chat
* SVG engine
* Wiring editor
* Component library
* Basic simulator
* GPIO
* ADC
* UART
* I²C core

Deliverable: Users can create, wire, simulate, and export simple Arduino/ESP32 projects.

---

## Phase 2 — Smart Devices

Duration: ~6 weeks

* OLED
* RTC
* BME280
* MPU6050
* GPS
* SD Card
* WiFi simulation
* HTTP
* MQTT
* Serial Monitor
* AI auto-wiring
* Simulation debugger

Deliverable: End-to-end IoT simulations with common peripherals and network interactions.

---

## Phase 3 — AI Platform

Duration: ~8 weeks

* Full project generation
* Documentation generation
* Automatic debugging
* AI code review
* AI wiring suggestions
* AI test scenarios
* Project templates

Deliverable: AI can generate and validate complete embedded projects from natural language.

---

## Phase 4 — Ecosystem

Duration: Ongoing

* Module SDK
* Community modules
* Marketplace
* Versioning
* Team workspaces
* GitHub integration
* PlatformIO export
* Public project gallery

---

# Future Vision

RakitIO evolves beyond an Arduino simulator into a complete embedded engineering platform.

Eventually supporting:

* Arduino
* ESP-IDF
* Raspberry Pi Pico SDK
* STM32
* Zephyr RTOS
* PlatformIO
* MicroPython
* CircuitPython
* Blockly

while maintaining the same AI-driven workflow, visual circuit editor, and browser-native simulation engine.

The long-term goal is for RakitIO to become the equivalent of "Figma + GitHub Copilot + Wokwi" for embedded systems development.

