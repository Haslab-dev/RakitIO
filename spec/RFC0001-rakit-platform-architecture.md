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

Simulation runs entirely inside the browser.

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

## Backend

* Cloudflare Workers
* Hono
* Drizzle ORM
* Turso
* Cloudflare R2
* Cloudflare KV (optional cache)
* Better Auth (or Auth.js if preferred)
* AI Gateway

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

Two top-level applications, no monorepo packages.

Shared logic lives as `lib/` directories inside each app.

```text
client/                         # Frontend (Vite + React)
    src/
        lib/
            svg/                # SVG rendering engine
            simulator/          # Browser-side simulation worker bridge
            types/              # Shared TypeScript types
            hooks/              # React hooks
            stores/             # Zustand stores
        components/             # UI components
        routes/                 # React Router pages
        workers/                # Web Workers for simulation

service/                        # Backend (Cloudflare Workers + Hono)
    src/
        lib/
            ai/                 # AI provider abstraction
            db/                 # Drizzle schema + Turso client
            simulator/          # Simulation engine core
            runtime/            # Arduino runtime abstraction
            parser/             # Arduino code parser
            device-sdk/         # Module system (module.json, logic, renderer)
            project/            # Project model + serialization
            shared/             # Types, constants, utilities
        routes/                 # Hono API routes
        middleware/             # Auth, CORS, etc.
```

---

# Architecture

```text
React (client/)

├── Monaco Editor
├── AI Chat Panel
├── Project Explorer
├── Wiring Playground (SVG Canvas)
├── Component Library
├── Serial Monitor
├── Device Inspector
└── Simulation Web Worker

↓ fetch()

Cloudflare Worker (service/)

├── Hono API
├── Auth (sessions)
├── Projects CRUD
├── AI Proxy
└── Turso (SQLite)
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

