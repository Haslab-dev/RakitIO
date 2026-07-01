# RakitIO Platform — Implementation Tasks

## Phase 0 — Project Setup
- [x] Create root package.json
- [x] Set up client/ (React 19 + Vite + TypeScript)
- [x] Set up service/ (Hono + Cloudflare Workers)
- [x] Root .gitignore
- [x] Install all dependencies
- [x] Rename Rakit → RakitIO across codebase

## Phase 1 — Backend Libraries + API
- [x] `lib/shared` — types, constants (6 boards, 18 components), utils
- [x] `lib/project` — project model, serialization, export (.ino, .json)
- [x] `lib/parser` — Arduino code parser
- [x] `lib/runtime` — Arduino runtime abstraction
- [x] `lib/ai` — AI providers (OpenAI, Anthropic, Gemini, OpenRouter) + generator
- [x] `lib/simulator` — simulation engine with cooperative scheduler
- [x] `lib/device-sdk` — module registry + 5 built-in modules
- [x] `lib/db` — Drizzle ORM schema + Turso connection
- [x] Auth routes (register, login, logout, me)
- [x] Projects CRUD
- [x] AI proxy endpoints

## Phase 1 — Frontend Libraries + UI
- [x] `lib/types` — client-side types
- [x] `lib/api` — API client with auth
- [x] `lib/stores` — Zustand (project w/ undo-redo, simulation, ui)
- [x] `lib/hooks` — TanStack Query hooks
- [x] TailwindCSS v4 + dark theme
- [x] React Router v7
- [x] Layout shell, Monaco Editor, Project Explorer, AI Chat
- [x] Wiring Playground, Component Library, Serial Monitor
- [x] Simulation Controls, Home page

## Phase 2 — SVG Boards & Components
- [x] Arduino Uno SVG renderer
- [x] ESP32 DevKit V1 SVG renderer
- [x] Breadboard SVG renderer
- [x] Raspberry Pi Pico SVG renderer
- [x] LED, Button, Resistor, Potentiometer, Servo, OLED, DHT22, BME280
- [x] Wire renderer (bezier curves)
- [x] Pin renderer (mode-colored)
- [x] SVG Canvas (zoom, pan, grid)

## Phase 3 — Simulation Engine
- [x] GPIO, ADC, PWM, UART, I2C, SPI, Clock, Scheduler subsystems
- [x] Subsystems integrated into simulator

## Phase 4 — AI Features
- [x] Project generation, code explanation, wiring validation
- [x] Error detection, board conversion, documentation generation
- [x] Streaming generation

## Phase 5 — Integration & Export
- [x] WiringPlayground wired to SVG renderers
- [x] SimulationControls wired to store
- [x] SerialMonitor wired to store
- [x] MonacoEditor wired to project store
- [x] EditorPage wiring all components
- [x] Web Worker simulation bridge
- [x] Export utilities (.ino, .json, ZIP, SVG)
- [x] Client typecheck passes
- [x] Client build passes
- [x] Service typecheck passes
