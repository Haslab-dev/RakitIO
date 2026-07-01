# RFC-0004 — Project File Format

## Status

Approved

---

# Goals

Define a stable, versioned, and standardized serialization format (`.rakit` / JSON) for RakitIO projects. The format must capture the complete state of a project, including schematic wiring, physical layouts, source code, external library dependencies, and simulation configurations.

---

# Schema Definition

A project file is serialized as a single JSON object:

```json
{
  "version": 1,
  "id": "project-uuid",
  "name": "My ESP32 Weather Station",
  "description": "Reads temperature and humidity from BME280 and displays on OLED.",
  "createdAt": "2026-06-30T14:28:00Z",
  "updatedAt": "2026-06-30T14:28:00Z",
  "board": {
    "id": "esp32-devkit-v1",
    "version": "1.0.0"
  },
  "components": [
    {
      "id": "bme280-1",
      "definitionId": "bme280",
      "version": "1.0.0",
      "label": "BME280 Sensor",
      "physical": {
        "x": 240,
        "y": 120,
        "rotation": 0,
        "layer": 1
      },
      "properties": {
        "temperature": 25.3,
        "humidity": 66.2
      }
    }
  ],
  "wires": [
    {
      "id": "wire-1",
      "color": "#ef4444",
      "connections": [
        { "componentId": "esp32-devkit-v1", "pinId": "3V3" },
        { "componentId": "bme280-1", "pinId": "VCC" }
      ],
      "segments": [
        { "x": 50, "y": 200 },
        { "x": 100, "y": 200 },
        { "x": 100, "y": 120 },
        { "x": 240, "y": 120 }
      ],
      "junctions": []
    }
  ],
  "code": [
    {
      "name": "weather_station.ino",
      "path": "/",
      "content": "#include <Wire.h>\nvoid setup() {\n  Wire.begin();\n}\nvoid loop() {}"
    }
  ],
  "libraries": [
    {
      "name": "Adafruit BME280 Library",
      "version": "2.2.2"
    }
  ],
  "simulation": {
    "speed": 1.0,
    "timeline": {
      "bookmarks": [],
      "recording": false
    }
  },
  "metadata": {
    "editor": {
      "zoom": 1.0,
      "pan": { "x": 0, "y": 0 }
    }
  }
}
```

---

# Design Principles

1.  **Logical vs. Physical Separation**: Components separate their identity and properties from their physical layout coords. Dragging a component only mutates `physical` coordinates and does not affect the simulation engine.
2.  **Explicit Routing (Segments & Junctions)**: Wires are stored as a series of connected line segments and junction points rather than simple direct lines, allowing KiCad-style auto-routing and manual wire sculpting.
3.  **Self-Contained Codebase**: All source files (`.ino`, `.h`, `.cpp`) are embedded directly in the `code` array.
4.  **Semantic Versioning**: The root `version` field tracks the file format version. Incompatible changes will increment this integer.
