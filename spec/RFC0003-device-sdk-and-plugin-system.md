# RFC-0003 — Device SDK & Plugin System

## Status

Approved

---

# Goals

Define a stable plugin system that allows new boards, sensors, displays, actuators, communication modules, and custom devices to be added to RakitIO without modifying the simulator core.

The SDK must support:

*   **Boards**: Master MCUs that execute compiled bytecode and drive buses.
*   **Components**: Peripheral devices that connect to buses and interact with the environment.
*   **Buses**: Virtualized communication protocols (GPIO, I2C, SPI, UART, PWM, ADC).
*   **Renderers**: Declarative SVG rendering of device states.
*   **AI Knowledge**: Local documentation templates for AI retrieval.
*   **Testing**: Unit testing interface for device simulation logic.
*   **Versioning**: Semantic versioning rules for backwards compatibility.

---

# Architecture

```text
Workspace
    │
    ▼
Simulation Engine
    │
    ▼
Bus Layer
    │
    ▼
Device Registry
    │
    ▼
Device Plugin
```

The simulation engine never imports device-specific code directly. Instead, it discovers and interacts with plugins through the **Device Registry** using standardized lifecycle hooks and bus abstractions.

---

# Device Package Layout

Every device is packaged as a self-contained folder under the device registry:

```text
device/
└── esp32-devkit-v1/
    ├── manifest.json       # Metadata, versioning, and entry points
    ├── board.svg           # High-fidelity, manufacturer-accurate SVG representation
    ├── logic.ts            # Device simulation logic
    ├── properties.json     # Schema-driven properties (slider, toggle, etc.)
    ├── docs.md             # Component documentation
    ├── ai.md               # AI wiring context and common mistakes
    ├── examples/           # Example projects
    └── tests/              # Unit tests for device logic
```

---

# Manifest

The `manifest.json` file declares the package configuration:

```json
{
  "id": "esp32-devkit-v1",
  "name": "ESP32 DevKit V1",
  "version": "1.0.0",
  "sdkVersion": "1.0.0",
  "engineVersion": "^1.0.0",
  "apiVersion": "1",
  "category": "board",
  "manufacturer": "Espressif",
  "protocols": ["gpio", "i2c", "spi", "uart", "pwm", "adc"],
  "entry": "./logic.ts"
}
```

---

# Device Lifecycle

Every device plugin must implement the following lifecycle interface:

```ts
export interface DeviceContext {
  id: string;
  readPin(pinId: string): number;
  writePin(pinId: string, value: number): void;
  emitEvent(type: string, payload: any): void;
}

export interface GPIOEvent {
  pinId: string;
  value: number;
}

export interface I2CEvent {
  type: 'start' | 'stop' | 'write' | 'read';
  address?: number;
  data?: number;
}

export interface RendererContext {
  select(selector: string): any;
  setAttribute(selector: string, name: string, value: string): void;
  setStyle(selector: string, name: string, value: string): void;
  setText(selector: string, text: string): void;
}

export interface DevicePlugin {
  onMount(ctx: DeviceContext): void;
  onTick(deltaMs: number): void;
  onGPIO?(event: GPIOEvent): void;
  onI2C?(event: I2CEvent): number | void; // Returns ACK/NACK or read byte
  onSPI?(data: number): number;
  onUART?(data: string): void;
  onPWM?(pinId: string, dutyCycle: number): void;
  onNetwork?(event: any): void;
  onRender(renderer: RendererContext): void;
  onDestroy(): void;
}
```

---

# Bus API

All communication between the Virtual MCU and peripheral devices flows through a virtualized bus layer:

*   **GPIO**: Direct digital logic lines.
*   **ADC**: Analog-to-digital conversion, conveying voltage levels (e.g., `0.0V` to `3.3V`).
*   **PWM**: Pulse-width modulation, conveying duty cycles and frequencies.
*   **I2C**: Multi-drop bus using 7-bit addresses. The bus broadcasts transactions, and the registry routes them to the device matching the target address (returning ACK/NACK).
*   **SPI / UART**: Serial streams.
*   **WiFi / BLE**: Virtualized network adapters.

---

# Pin Model

Pins are first-class entities with capabilities:

```ts
export interface Pin {
  id: string;
  label: string;
  capabilities: (
    | "gpio"
    | "adc"
    | "dac"
    | "pwm"
    | "i2c-sda"
    | "i2c-scl"
    | "spi-mosi"
    | "spi-miso"
    | "spi-sck"
    | "uart-tx"
    | "uart-rx"
  )[];
}
```

Physical pin positions are extracted dynamically from the `board.svg` file by identifying elements with `class="pin"` and matching their `id` attribute.

---

# Property Schema

Device properties are schema-driven, allowing the UI to render control panels automatically:

```json
{
  "temperature": {
    "type": "slider",
    "label": "Temperature",
    "min": -40,
    "max": 85,
    "default": 25,
    "unit": "°C"
  },
  "humidity": {
    "type": "slider",
    "label": "Humidity",
    "min": 0,
    "max": 100,
    "default": 50,
    "unit": "%"
  }
}
```

---

# Rendering Contract

The UI uses a **Scene Graph** to render the viewport. Static SVG structures are loaded and cached. Only elements targeted by `onRender` via the `RendererContext` are modified dynamically (e.g., modifying the rotation of a servo horn or writing text on an OLED screen).

---

# AI Metadata

The `ai.md` file provides local context for the LLM during project generation, including:
*   Pin connection requirements.
*   Required libraries and include statements.
*   Typical configuration parameters.
*   Common bugs and troubleshooting steps.
