import { useState, useMemo } from 'react'
import { useProjectStore } from '../lib/stores'
import type { ComponentDefinition, ComponentInstance } from '../lib/types'

const COMPONENT_CATEGORIES = [
  'All',
  'LEDs',
  'Sensors',
  'Actuators',
  'Input',
  'Communication',
  'Passive',
  'Power',
]

const LIBRARY_COMPONENTS: ComponentDefinition[] = [
  {
    id: 'led',
    name: 'LED',
    category: 'LEDs',
    description: 'Standard light-emitting diode',
    width: 30,
    height: 40,
    pins: [
      { id: 'anode', name: 'Anode', mode: 'INPUT' as never, x: 15, y: 0 },
      { id: 'cathode', name: 'Cathode', mode: 'GND' as never, x: 15, y: 40 },
    ],
    icon: '💡',
    defaultCode: 'pinMode(LED_PIN, OUTPUT);\ndigitalWrite(LED_PIN, HIGH);',
  },
  {
    id: 'rgb-led',
    name: 'RGB LED',
    category: 'LEDs',
    description: 'Red, green, blue LED',
    width: 40,
    height: 40,
    pins: [
      { id: 'r', name: 'R', mode: 'PWM' as never, x: 0, y: 20 },
      { id: 'g', name: 'G', mode: 'PWM' as never, x: 20, y: 0 },
      { id: 'b', name: 'B', mode: 'PWM' as never, x: 40, y: 20 },
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: 20, y: 40 },
    ],
    icon: '🌈',
  },
  {
    id: 'button',
    name: 'Push Button',
    category: 'Input',
    description: 'Momentary tactile push button',
    width: 36,
    height: 36,
    pins: [
      { id: 'pin1', name: 'Pin 1', mode: 'INPUT' as never, x: 0, y: 18 },
      { id: 'pin2', name: 'Pin 2', mode: 'INPUT' as never, x: 36, y: 18 },
    ],
    icon: '🔘',
  },
  {
    id: 'potentiometer',
    name: 'Potentiometer',
    category: 'Input',
    description: 'Variable resistor (10kΩ)',
    width: 40,
    height: 40,
    pins: [
      { id: 'vcc', name: 'VCC', mode: 'VCC' as never, x: 0, y: 20 },
      { id: 'wiper', name: 'Wiper', mode: 'ANALOG' as never, x: 20, y: 0 },
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: 40, y: 20 },
    ],
    icon: '🎚',
  },
  {
    id: 'servo',
    name: 'Servo Motor',
    category: 'Actuators',
    description: 'SG90 micro servo motor',
    width: 50,
    height: 40,
    pins: [
      { id: 'signal', name: 'Signal', mode: 'PWM' as never, x: 0, y: 10 },
      { id: 'vcc', name: 'VCC', mode: 'VCC' as never, x: 25, y: 0 },
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: 50, y: 10 },
    ],
    icon: '⚙️',
  },
  {
    id: 'dht11',
    name: 'DHT11',
    category: 'Sensors',
    description: 'Temperature and humidity sensor',
    width: 40,
    height: 50,
    pins: [
      { id: 'vcc', name: 'VCC', mode: 'VCC' as never, x: 0, y: 10 },
      { id: 'data', name: 'Data', mode: 'INPUT' as never, x: 20, y: 0 },
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: 40, y: 10 },
    ],
    icon: '🌡',
  },
  {
    id: 'ultrasonic',
    name: 'Ultrasonic Sensor',
    category: 'Sensors',
    description: 'HC-SR04 distance sensor',
    width: 60,
    height: 40,
    pins: [
      { id: 'vcc', name: 'VCC', mode: 'VCC' as never, x: 0, y: 20 },
      { id: 'trig', name: 'Trig', mode: 'OUTPUT' as never, x: 20, y: 0 },
      { id: 'echo', name: 'Echo', mode: 'INPUT' as never, x: 40, y: 0 },
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: 60, y: 20 },
    ],
    icon: '📡',
  },
  {
    id: 'resistor',
    name: 'Resistor',
    category: 'Passive',
    description: '220Ω resistor',
    width: 40,
    height: 16,
    pins: [
      { id: 'pin1', name: 'Pin 1', mode: 'INPUT' as never, x: 0, y: 8 },
      { id: 'pin2', name: 'Pin 2', mode: 'OUTPUT' as never, x: 40, y: 8 },
    ],
    icon: '⚡',
  },
  {
    id: 'lcd16x2',
    name: 'LCD 16x2',
    category: 'Communication',
    description: '16x2 character LCD display (I2C)',
    width: 80,
    height: 50,
    pins: [
      { id: 'vcc', name: 'VCC', mode: 'VCC' as never, x: 0, y: 10 },
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: 0, y: 30 },
      { id: 'sda', name: 'SDA', mode: 'I2C_SDA' as never, x: 80, y: 10 },
      { id: 'scl', name: 'SCL', mode: 'I2C_SCL' as never, x: 80, y: 30 },
    ],
    icon: '📺',
  },
  {
    id: 'buzzer',
    name: 'Buzzer',
    category: 'Actuators',
    description: 'Piezo buzzer',
    width: 30,
    height: 30,
    pins: [
      { id: 'signal', name: 'Signal', mode: 'PWM' as never, x: 15, y: 0 },
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: 15, y: 30 },
    ],
    icon: '🔔',
  },
]

export default function ComponentLibrary() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const project = useProjectStore((s) => s.project)
  const addComponent = useProjectStore((s) => s.addComponent)

  const filtered = useMemo(() => {
    return LIBRARY_COMPONENTS.filter((c) => {
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        activeCategory === 'All' || c.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  const handleAdd = (def: ComponentDefinition) => {
    if (!project) return
    const instance: ComponentInstance = {
      id: `${def.id}-${Date.now()}`,
      definitionId: def.id,
      x: 200 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      rotation: 0,
      label: def.name,
      properties: {},
    }
    addComponent(instance)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          Components
        </span>
      </div>

      <div className="px-3 py-2 border-b border-border">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search components..."
          className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
        />
      </div>

      <div className="flex gap-1 px-3 py-2 border-b border-border overflow-x-auto shrink-0">
        {COMPONENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2 py-0.5 text-xs rounded whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-accent/20 text-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {filtered.map((comp) => (
          <button
            key={comp.id}
            onClick={() => handleAdd(comp)}
            className="w-full text-left px-3 py-2 hover:bg-bg-hover transition-colors flex items-start gap-2"
          >
            <span className="text-lg leading-none mt-0.5">{comp.icon}</span>
            <div className="min-w-0">
              <div className="text-xs font-medium text-text-primary">{comp.name}</div>
              <div className="text-xs text-text-secondary truncate">{comp.description}</div>
              <div className="text-xs text-text-secondary mt-0.5">
                {comp.pins.length} pins · {comp.category}
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-text-secondary text-xs text-center">
            No components match your search.
          </div>
        )}
      </div>
    </div>
  )
}

export { LIBRARY_COMPONENTS }
