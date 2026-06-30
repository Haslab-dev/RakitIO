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
    width: 50,
    height: 66,
    pins: [
      { id: 'anode', name: 'Anode', mode: 'INPUT' as never, x: 29, y: 58 },
      { id: 'cathode', name: 'Cathode', mode: 'GND' as never, x: 21, y: 58 },
    ],
    icon: '💡',
    defaultCode: 'pinMode(LED_PIN, OUTPUT);\ndigitalWrite(LED_PIN, HIGH);',
  },
  {
    id: 'rgb-led',
    name: 'RGB LED',
    category: 'LEDs',
    description: 'Red, green, blue LED',
    width: 66,
    height: 66,
    pins: [
      { id: 'r', name: 'R', mode: 'PWM' as never, x: 21, y: 58 },
      { id: 'g', name: 'G', mode: 'PWM' as never, x: 29, y: 58 },
      { id: 'b', name: 'B', mode: 'PWM' as never, x: 37, y: 58 },
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: 45, y: 58 },
    ],
    icon: '🌈',
  },
  {
    id: 'button',
    name: 'Push Button',
    category: 'Input',
    description: 'Momentary tactile push button',
    width: 60,
    height: 60,
    pins: [
      { id: 'pin1', name: 'Pin 1', mode: 'INPUT' as never, x: 12, y: 30 },
      { id: 'pin2', name: 'Pin 2', mode: 'INPUT' as never, x: 48, y: 30 },
    ],
    icon: '🔘',
  },
  {
    id: 'potentiometer',
    name: 'Potentiometer',
    category: 'Input',
    description: 'Variable resistor (10kΩ)',
    width: 66,
    height: 66,
    pins: [
      { id: 'vcc', name: 'VCC', mode: 'VCC' as never, x: 21, y: 62 },
      { id: 'wiper', name: 'Wiper', mode: 'ANALOG' as never, x: 33, y: 62 },
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: 45, y: 62 },
    ],
    icon: '🎚',
  },
  {
    id: 'servo',
    name: 'Servo Motor',
    category: 'Actuators',
    description: 'SG90 micro servo motor',
    width: 86,
    height: 66,
    pins: [
      { id: 'signal', name: 'Signal', mode: 'PWM' as never, x: -25, y: 20 },
      { id: 'vcc', name: 'VCC', mode: 'VCC' as never, x: -25, y: 33 },
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: -25, y: 46 },
    ],
    icon: '⚙️',
  },
  {
    id: 'dht11',
    name: 'DHT11',
    category: 'Sensors',
    description: 'Temperature and humidity sensor',
    width: 66,
    height: 82,
    pins: [
      { id: 'vcc', name: 'VCC', mode: 'VCC' as never, x: 21, y: 74 },
      { id: 'data', name: 'Data', mode: 'INPUT' as never, x: 33, y: 74 },
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: 45, y: 74 },
    ],
    icon: '🌡',
  },
  {
    id: 'bme280',
    name: 'BME280',
    category: 'Sensors',
    description: 'I2C temperature, humidity & pressure sensor',
    width: 42,
    height: 44,
    pins: [
      { id: 'vcc', name: 'VCC', mode: 'VCC' as never, x: 6, y: 40 },
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: 16, y: 40 },
      { id: 'scl', name: 'SCL', mode: 'I2C_SCL' as never, x: 26, y: 40 },
      { id: 'sda', name: 'SDA', mode: 'I2C_SDA' as never, x: 36, y: 40 },
    ],
    icon: '🌡',
  },
  {
    id: 'ssd1306',
    name: 'OLED SSD1306',
    category: 'Communication',
    description: '0.96" I2C OLED display (128x64)',
    width: 38,
    height: 40,
    pins: [
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: 10, y: 36 },
      { id: 'vcc', name: 'VCC', mode: 'VCC' as never, x: 16, y: 36 },
      { id: 'scl', name: 'SCL', mode: 'I2C_SCL' as never, x: 22, y: 36 },
      { id: 'sda', name: 'SDA', mode: 'I2C_SDA' as never, x: 28, y: 36 },
    ],
    icon: '🖥',
  },
  {
    id: 'ultrasonic',
    name: 'Ultrasonic Sensor',
    category: 'Sensors',
    description: 'HC-SR04 distance sensor',
    width: 100,
    height: 66,
    pins: [
      { id: 'vcc', name: 'VCC', mode: 'VCC' as never, x: 32, y: 58 },
      { id: 'trig', name: 'Trig', mode: 'OUTPUT' as never, x: 44, y: 58 },
      { id: 'echo', name: 'Echo', mode: 'INPUT' as never, x: 56, y: 58 },
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: 68, y: 58 },
    ],
    icon: '📡',
  },
  {
    id: 'resistor',
    name: 'Resistor',
    category: 'Passive',
    description: '220Ω resistor',
    width: 50,
    height: 20,
    pins: [
      { id: 'pin1', name: 'Pin 1', mode: 'INPUT' as never, x: 0, y: 10 },
      { id: 'pin2', name: 'Pin 2', mode: 'OUTPUT' as never, x: 50, y: 10 },
    ],
    icon: '⚡',
  },
  {
    id: 'lcd16x2',
    name: 'LCD 16x2',
    category: 'Communication',
    description: '16x2 character LCD display (I2C)',
    width: 130,
    height: 80,
    pins: [
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: 26, y: 72 },
      { id: 'vcc', name: 'VCC', mode: 'VCC' as never, x: 52, y: 72 },
      { id: 'scl', name: 'SCL', mode: 'I2C_SCL' as never, x: 78, y: 72 },
      { id: 'sda', name: 'SDA', mode: 'I2C_SDA' as never, x: 104, y: 72 },
    ],
    icon: '📺',
  },
  {
    id: 'buzzer',
    name: 'Buzzer',
    category: 'Actuators',
    description: 'Piezo buzzer',
    width: 52,
    height: 52,
    pins: [
      { id: 'signal', name: 'Signal', mode: 'PWM' as never, x: 18, y: 46 },
      { id: 'gnd', name: 'GND', mode: 'GND' as never, x: 34, y: 46 },
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

      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 content-start">
        {filtered.map((comp) => (
          <button
            key={comp.id}
            onClick={() => handleAdd(comp)}
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-bg-primary hover:bg-bg-hover transition-all duration-200 group hover:border-accent/30 text-center cursor-pointer shadow-sm hover:shadow"
          >
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
              {comp.icon}
            </span>
            <div className="text-[10px] font-semibold text-text-primary truncate w-full">
              {comp.name}
            </div>
            <div className="text-[9px] text-text-secondary truncate w-full mt-0.5">
              {comp.category}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 py-8 text-text-secondary text-xs text-center">
            No components match your search.
          </div>
        )}
      </div>
    </div>
  )
}

export { LIBRARY_COMPONENTS }
