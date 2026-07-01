# RFC-0005 — AI Context & Prompt Architecture

## Status

Approved

---

# Goals

Define a structured context injection and prompt engineering architecture for RakitIO's AI Assistant. The AI must be capable of generating correct wiring schematics, writing compilable C++ code, explaining circuits, and diagnosing bugs in the simulation.

To do this, we establish a **Workspace Context Injector** that translates the active Workspace state into a dense, structured context payload for the LLM.

---

# Prompt Architecture

```
┌────────────────────────────────────────────────────────┐
│                   System Instruction                   │
│  (Embedded rules, C++ formatting, wiring constraints)  │
├────────────────────────────────────────────────────────┤
│                   Hardware Registry                    │
│      (JSON metadata schemas from active devices)       │
├────────────────────────────────────────────────────────┤
│                   Workspace Context                    │
│ (Active board, connected components, nets, and code)  │
├────────────────────────────────────────────────────────┤
│                   Simulation State                     │
│    (Current errors, logic analyzer trace, variables)   │
├────────────────────────────────────────────────────────┤
│                   User Conversation                    │
│               (Chat history and prompt)                │
└────────────────────────────────────────────────────────┘
```

---

# Workspace Context Injection Schema

When a user invokes the AI, the engine compiles the active `Workspace` into the following structured JSON block:

```json
{
  "project": {
    "board": "esp32-devkit-v1",
    "components": [
      {
        "id": "bme280-1",
        "type": "bme280",
        "capabilities": ["i2c"]
      },
      {
        "id": "oled-1",
        "type": "ssd1306",
        "capabilities": ["i2c"]
      }
    ],
    "nets": [
      {
        "netId": "i2c-sda",
        "state": "PULLUP",
        "connections": [
          { "componentId": "esp32-devkit-v1", "pinId": "GPIO21" },
          { "componentId": "bme280-1", "pinId": "SDA" },
          { "componentId": "oled-1", "pinId": "SDA" }
        ]
      },
      {
        "netId": "i2c-scl",
        "state": "PULLUP",
        "connections": [
          { "componentId": "esp32-devkit-v1", "pinId": "GPIO22" },
          { "componentId": "bme280-1", "pinId": "SCL" },
          { "componentId": "oled-1", "pinId": "SCL" }
        ]
      }
    ]
  },
  "simulation": {
    "lastError": "I2C Transaction Timeout on Address 0x3C",
    "timeline": {
      "secondsRecorded": 3.4,
      "eventsCount": 142
    },
    "variables": {
      "temperature": 25.3,
      "displayInitialized": false
    }
  }
}
```

---

# AI Services Layer

Instead of a single monolith, the AI subsystem is divided into specialized modules:

1.  **Planner**: Resolves user queries into a sequence of commands (e.g., `AddComponent`, `ConnectPins`).
2.  **Code Generator**: Emits compilable Arduino C++ code matching the active hardware configuration.
3.  **Reviewer**: Analyzes the Workspace Netlist for electrical issues (e.g., missing pull-up resistors on I2C lines).
4.  **Debugger**: Analyzes simulation logs and variable inspector states to identify runtime logic errors.
5.  **Wiring Assistant**: Calculates optimal pin assignments and connection paths.
