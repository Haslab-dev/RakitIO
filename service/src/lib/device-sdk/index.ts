import type { ComponentDefinition, ComponentCategory } from '../shared';
import {
  LED,
  BUTTON,
  RESISTOR,
  POTENTIOMETER,
  DHT22,
  BME280,
  SSD1306_OLED,
  SERVO,
  RELAY,
  GPS_MODULE,
  MPU6050,
  BH1750,
  DS3231_RTC,
  SD_CARD_MODULE,
  LORA_MODULE,
  LDR,
  PIR_SENSOR,
  ROTARY_ENCODER,
} from '../shared';

export interface DeviceModule {
  definition: ComponentDefinition;
  onMount?(instanceId: string, properties: Record<string, unknown>): void;
  onUnmount?(instanceId: string): void;
  onPropertyChange?(instanceId: string, key: string, value: unknown): void;
  tick?(instanceId: string, microseconds: number): void;
  handlePinChange?(instanceId: string, pinId: string, value: number): void;
  getState?(instanceId: string): Record<string, unknown>;
}

export interface DeviceRegistry {
  register(module: DeviceModule): void;
  unregister(moduleId: string): void;
  get(moduleId: string): DeviceModule | undefined;
  getAll(): DeviceModule[];
  getByCategory(category: string): DeviceModule[];
  search(query: string): DeviceModule[];
}

export function createDeviceRegistry(): DeviceRegistry {
  const modules = new Map<string, DeviceModule>();

  return {
    register(module: DeviceModule): void {
      const id = module.definition.id;
      if (modules.has(id)) {
        throw new Error(`Module "${id}" is already registered`);
      }
      modules.set(id, module);
    },

    unregister(moduleId: string): void {
      modules.delete(moduleId);
    },

    get(moduleId: string): DeviceModule | undefined {
      return modules.get(moduleId);
    },

    getAll(): DeviceModule[] {
      return [...modules.values()];
    },

    getByCategory(category: string): DeviceModule[] {
      return [...modules.values()].filter(
        (m) => m.definition.category === category
      );
    },

    search(query: string): DeviceModule[] {
      const q = query.toLowerCase();
      return [...modules.values()].filter((m) => {
        const def = m.definition;
        return (
          def.name.toLowerCase().includes(q) ||
          def.description.toLowerCase().includes(q) ||
          def.id.toLowerCase().includes(q) ||
          def.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    },
  };
}

function createSimpleModule(definition: ComponentDefinition): DeviceModule {
  const instanceStates = new Map<string, Record<string, unknown>>();

  return {
    definition,

    onMount(instanceId: string, properties: Record<string, unknown>): void {
      instanceStates.set(instanceId, { ...properties, powered: false, value: 0 });
    },

    onUnmount(instanceId: string): void {
      instanceStates.delete(instanceId);
    },

    onPropertyChange(instanceId: string, key: string, value: unknown): void {
      const state = instanceStates.get(instanceId);
      if (state) {
        state[key] = value;
      }
    },

    tick(_instanceId: string, _microseconds: number): void {
      // default no-op tick
    },

    handlePinChange(instanceId: string, pinId: string, value: number): void {
      const state = instanceStates.get(instanceId);
      if (state) {
        state[`${pinId}_value`] = value;
      }
    },

    getState(instanceId: string): Record<string, unknown> {
      return { ...(instanceStates.get(instanceId) ?? {}) };
    },
  };
}

function createLedModule(): DeviceModule {
  const instanceStates = new Map<string, Record<string, unknown>>();
  const base = createSimpleModule(LED);

  return {
    definition: LED,

    onMount(instanceId: string, properties: Record<string, unknown>): void {
      base.onMount?.(instanceId, properties);
      instanceStates.set(instanceId, {
        color: (properties.color as string) ?? 'red',
        brightness: 0,
        on: false,
      });
    },

    onUnmount(instanceId: string): void {
      base.onUnmount?.(instanceId);
      instanceStates.delete(instanceId);
    },

    onPropertyChange(instanceId: string, key: string, value: unknown): void {
      base.onPropertyChange?.(instanceId, key, value);
      const state = instanceStates.get(instanceId);
      if (state && key === 'color') {
        state.color = value;
      }
    },

    tick(_instanceId: string, _microseconds: number): void {},

    handlePinChange(instanceId: string, pinId: string, value: number): void {
      const state = instanceStates.get(instanceId);
      if (state && pinId === 'anode') {
        state.on = value > 0;
        state.brightness = Math.min(255, Math.max(0, value));
      }
    },

    getState(instanceId: string): Record<string, unknown> {
      return { ...(instanceStates.get(instanceId) ?? {}) };
    },
  };
}

function createButtonModule(): DeviceModule {
  const instanceStates = new Map<string, Record<string, unknown>>();
  const base = createSimpleModule(BUTTON);

  return {
    definition: BUTTON,

    onMount(instanceId: string, properties: Record<string, unknown>): void {
      base.onMount?.(instanceId, properties);
      instanceStates.set(instanceId, {
        pressed: false,
        normallyOpen: (properties.normallyOpen as boolean) ?? true,
      });
    },

    onUnmount(instanceId: string): void {
      base.onUnmount?.(instanceId);
      instanceStates.delete(instanceId);
    },

    onPropertyChange(instanceId: string, key: string, value: unknown): void {
      base.onPropertyChange?.(instanceId, key, value);
      const state = instanceStates.get(instanceId);
      if (state && key === 'normallyOpen') {
        state.normallyOpen = value;
      }
    },

    tick(_instanceId: string, _microseconds: number): void {},

    handlePinChange(instanceId: string, pinId: string, value: number): void {
      const state = instanceStates.get(instanceId);
      if (state && (pinId === 'pin1' || pinId === 'pin2')) {
        state.pressed = value > 0;
      }
    },

    getState(instanceId: string): Record<string, unknown> {
      return { ...(instanceStates.get(instanceId) ?? {}) };
    },
  };
}

function createServoModule(): DeviceModule {
  const instanceStates = new Map<string, Record<string, unknown>>();
  const base = createSimpleModule(SERVO);

  return {
    definition: SERVO,

    onMount(instanceId: string, properties: Record<string, unknown>): void {
      base.onMount?.(instanceId, properties);
      instanceStates.set(instanceId, {
        angle: 90,
        minAngle: (properties.minAngle as number) ?? 0,
        maxAngle: (properties.maxAngle as number) ?? 180,
        minPulse: (properties.minPulse as number) ?? 544,
        maxPulse: (properties.maxPulse as number) ?? 2400,
      });
    },

    onUnmount(instanceId: string): void {
      base.onUnmount?.(instanceId);
      instanceStates.delete(instanceId);
    },

    onPropertyChange(instanceId: string, key: string, value: unknown): void {
      base.onPropertyChange?.(instanceId, key, value);
      const state = instanceStates.get(instanceId);
      if (state) {
        if (key === 'minAngle' || key === 'maxAngle' || key === 'minPulse' || key === 'maxPulse') {
          state[key] = value;
        }
      }
    },

    tick(_instanceId: string, _microseconds: number): void {},

    handlePinChange(instanceId: string, pinId: string, value: number): void {
      const state = instanceStates.get(instanceId);
      if (state && pinId === 'signal') {
        const minAngle = state.minAngle as number;
        const maxAngle = state.maxAngle as number;
        const dutyFraction = Math.max(0, Math.min(255, value)) / 255;
        state.angle = minAngle + dutyFraction * (maxAngle - minAngle);
      }
    },

    getState(instanceId: string): Record<string, unknown> {
      return { ...(instanceStates.get(instanceId) ?? {}) };
    },
  };
}

function createPotentiometerModule(): DeviceModule {
  const instanceStates = new Map<string, Record<string, unknown>>();
  const base = createSimpleModule(POTENTIOMETER);

  return {
    definition: POTENTIOMETER,

    onMount(instanceId: string, properties: Record<string, unknown>): void {
      base.onMount?.(instanceId, properties);
      const position = (properties.position as number) ?? 50;
      instanceStates.set(instanceId, {
        position,
        resistance: (properties.resistance as number) ?? 10000,
        analogValue: Math.round((position / 100) * 1023),
      });
    },

    onUnmount(instanceId: string): void {
      base.onUnmount?.(instanceId);
      instanceStates.delete(instanceId);
    },

    onPropertyChange(instanceId: string, key: string, value: unknown): void {
      base.onPropertyChange?.(instanceId, key, value);
      const state = instanceStates.get(instanceId);
      if (state) {
        if (key === 'position') {
          state.position = value;
          state.analogValue = Math.round(((value as number) / 100) * 1023);
        } else if (key === 'resistance') {
          state.resistance = value;
        }
      }
    },

    tick(_instanceId: string, _microseconds: number): void {},

    handlePinChange(_instanceId: string, _pinId: string, _value: number): void {},

    getState(instanceId: string): Record<string, unknown> {
      return { ...(instanceStates.get(instanceId) ?? {}) };
    },
  };
}

function createDht22Module(): DeviceModule {
  const instanceStates = new Map<string, Record<string, unknown>>();
  const base = createSimpleModule(DHT22);

  return {
    definition: DHT22,

    onMount(instanceId: string, properties: Record<string, unknown>): void {
      base.onMount?.(instanceId, properties);
      instanceStates.set(instanceId, {
        temperature: 25.0,
        humidity: 50.0,
        lastReadTime: 0,
        readInterval: (properties.readInterval as number) ?? 2000,
      });
    },

    onUnmount(instanceId: string): void {
      base.onUnmount?.(instanceId);
      instanceStates.delete(instanceId);
    },

    onPropertyChange(instanceId: string, key: string, value: unknown): void {
      base.onPropertyChange?.(instanceId, key, value);
      const state = instanceStates.get(instanceId);
      if (state && key === 'readInterval') {
        state.readInterval = value;
      }
    },

    tick(instanceId: string, microseconds: number): void {
      const state = instanceStates.get(instanceId);
      if (state) {
        const interval = (state.readInterval as number) * 1000;
        const elapsed = microseconds - (state.lastReadTime as number);
        if (elapsed >= interval) {
          state.temperature = 20 + Math.random() * 10;
          state.humidity = 40 + Math.random() * 30;
          state.lastReadTime = microseconds;
        }
      }
    },

    handlePinChange(_instanceId: string, _pinId: string, _value: number): void {},

    getState(instanceId: string): Record<string, unknown> {
      return { ...(instanceStates.get(instanceId) ?? {}) };
    },
  };
}

export function registerBuiltinModules(registry: DeviceRegistry): void {
  registry.register(createLedModule());
  registry.register(createButtonModule());
  registry.register(createSimpleModule(RESISTOR));
  registry.register(createPotentiometerModule());
  registry.register(createDht22Module());
  registry.register(createSimpleModule(BME280));
  registry.register(createSimpleModule(SSD1306_OLED));
  registry.register(createServoModule());
  registry.register(createSimpleModule(RELAY));
  registry.register(createSimpleModule(GPS_MODULE));
  registry.register(createSimpleModule(MPU6050));
  registry.register(createSimpleModule(BH1750));
  registry.register(createSimpleModule(DS3231_RTC));
  registry.register(createSimpleModule(SD_CARD_MODULE));
  registry.register(createSimpleModule(LORA_MODULE));
  registry.register(createSimpleModule(LDR));
  registry.register(createSimpleModule(PIR_SENSOR));
  registry.register(createSimpleModule(ROTARY_ENCODER));
}
