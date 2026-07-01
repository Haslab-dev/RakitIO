import { useRef, useState, useCallback, useEffect } from 'react'
import { useProjectStore, useUIStore, useSimulationStore } from '../lib/stores'
import { BoardRenderer, ComponentRenderer, WireRenderer, PinRenderer } from '../lib/svg'
import { LIBRARY_COMPONENTS } from './ComponentLibrary'
import type { ComponentInstance, WireConnection, PinMode } from '../lib/types'

const GRID_SIZE = 20
const PIN_HIT_RADIUS = 14

function snapToGrid(v: number): number {
  return Math.round(v / GRID_SIZE) * GRID_SIZE
}

function getComponentDef(definitionId: string) {
  return LIBRARY_COMPONENTS.find((c) => c.id === definitionId)
}

const WIRE_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#f97316']

interface DragState {
  componentId: string
  offsetX: number
  offsetY: number
}

interface WireDrawState {
  fromComponentId: string
  fromPinId: string
  fromX: number
  fromY: number
  currentX: number
  currentY: number
}

interface PinWorldPos {
  componentId: string
  pinId: string
  x: number
  y: number
}

function rotatePoint(x: number, y: number, cx: number, cy: number, angle: number): { x: number; y: number } {
  if (!angle) return { x, y }
  const rad = (angle * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = x - cx
  const dy = y - cy
  return {
    x: cx + (dx * cos - dy * sin),
    y: cy + (dx * sin + dy * cos),
  }
}

import type { PinDefinition } from '../lib/types'

const ESP32_PINS: PinDefinition[] = [
  // Left side
  { id: '3V3', name: '3V3', x: 32, y: 206, mode: 'VCC' },
  { id: 'EN', name: 'EN', x: 32, y: 223, mode: 'INPUT' },
  { id: 'SVP', name: 'SVP', x: 32, y: 240, mode: 'INPUT' },
  { id: 'SVN', name: 'SVN', x: 32, y: 257, mode: 'INPUT' },
  { id: 'GPIO34', name: '34', x: 32, y: 274, mode: 'INPUT' },
  { id: 'GPIO35', name: '35', x: 32, y: 291, mode: 'INPUT' },
  { id: 'GPIO32', name: '32', x: 32, y: 308, mode: 'IO' },
  { id: 'GPIO33', name: '33', x: 32, y: 325, mode: 'IO' },
  { id: 'GPIO25', name: '25', x: 32, y: 342, mode: 'IO' },
  { id: 'GPIO26', name: '26', x: 32, y: 359, mode: 'IO' },
  { id: 'GPIO27', name: '27', x: 32, y: 376, mode: 'IO' },
  { id: 'GPIO14', name: '14', x: 32, y: 393, mode: 'IO' },
  { id: 'GPIO12', name: '12', x: 32, y: 410, mode: 'IO' },
  { id: 'GND', name: 'GND', x: 32, y: 427, mode: 'GND' },
  { id: 'GPIO13', name: '13', x: 32, y: 444, mode: 'IO' },

  // Right side
  { id: 'VIN', name: 'VIN', x: 368, y: 206, mode: 'VCC' },
  { id: 'GND2', name: 'GND', x: 368, y: 223, mode: 'GND' },
  { id: 'GPIO15', name: '15', x: 368, y: 240, mode: 'IO' },
  { id: 'GPIO2', name: '2', x: 368, y: 257, mode: 'IO' },
  { id: 'GPIO4', name: '4', x: 368, y: 274, mode: 'IO' },
  { id: 'GPIO16', name: '16', x: 368, y: 291, mode: 'IO' },
  { id: 'GPIO17', name: '17', x: 368, y: 308, mode: 'IO' },
  { id: 'GPIO5', name: '5', x: 368, y: 325, mode: 'IO' },
  { id: 'GPIO18', name: '18', x: 368, y: 342, mode: 'IO' },
  { id: 'GPIO19', name: '19', x: 368, y: 359, mode: 'IO' },
  { id: 'GPIO21', name: '21', x: 368, y: 376, mode: 'IO' },
  { id: 'GPIO3', name: 'RX', x: 368, y: 393, mode: 'IO' },
  { id: 'GPIO1', name: 'TX', x: 368, y: 410, mode: 'IO' },
  { id: 'GPIO22', name: '22', x: 368, y: 427, mode: 'IO' },
  { id: 'GPIO23', name: '23', x: 368, y: 444, mode: 'IO' },
].map((p, i) => ({ ...p, number: i } as any))

const UNO_PINS: PinDefinition[] = [
  // Power / Analog (Left Side Headers - Top to Bottom)
  { id: 'IOREF', name: 'IOREF', x: 35, y: 145, mode: 'VCC' },
  { id: 'RESET', name: 'RESET', x: 35, y: 160, mode: 'INPUT' },
  { id: '3V3', name: '3.3V', x: 35, y: 175, mode: 'VCC' },
  { id: '5V', name: '5V', x: 35, y: 190, mode: 'VCC' },
  { id: 'GND', name: 'GND', x: 35, y: 205, mode: 'GND' },
  { id: 'GND2', name: 'GND', x: 35, y: 220, mode: 'GND' },
  { id: 'VIN', name: 'VIN', x: 35, y: 235, mode: 'VCC' },
  
  { id: 'A0', name: 'A0', x: 35, y: 275, mode: 'ANALOG' },
  { id: 'A1', name: 'A1', x: 35, y: 290, mode: 'ANALOG' },
  { id: 'A2', name: 'A2', x: 35, y: 305, mode: 'ANALOG' },
  { id: 'A3', name: 'A3', x: 35, y: 320, mode: 'ANALOG' },
  { id: 'A4', name: 'A4', x: 35, y: 335, mode: 'ANALOG' },
  { id: 'A5', name: 'A5', x: 35, y: 350, mode: 'ANALOG' },

  // Digital / Communication (Right Side Headers - Top to Bottom)
  { id: 'SCL', name: 'SCL', x: 345, y: 85, mode: 'IO' },
  { id: 'SDA', name: 'SDA', x: 345, y: 100, mode: 'IO' },
  { id: 'AREF', name: 'AREF', x: 345, y: 115, mode: 'INPUT' },
  { id: 'GND3', name: 'GND', x: 345, y: 130, mode: 'GND' },
  { id: 'D13', name: 'D13', x: 345, y: 145, mode: 'IO' },
  { id: 'D12', name: 'D12', x: 345, y: 160, mode: 'IO' },
  { id: 'D11', name: 'D11', x: 345, y: 175, mode: 'IO' },
  { id: 'D10', name: 'D10', x: 345, y: 190, mode: 'IO' },
  { id: 'D9', name: 'D9', x: 345, y: 205, mode: 'IO' },
  { id: 'D8', name: 'D8', x: 345, y: 220, mode: 'IO' },
  
  // Gap between D8 and D7 (28px vertical difference)
  { id: 'D7', name: 'D7', x: 345, y: 248, mode: 'IO' },
  { id: 'D6', name: 'D6', x: 345, y: 263, mode: 'IO' },
  { id: 'D5', name: 'D5', x: 345, y: 278, mode: 'IO' },
  { id: 'D4', name: 'D4', x: 345, y: 293, mode: 'IO' },
  { id: 'D3', name: 'D3', x: 345, y: 308, mode: 'IO' },
  { id: 'D2', name: 'D2', x: 345, y: 323, mode: 'IO' },
  { id: 'D1', name: 'TX->1', x: 345, y: 338, mode: 'IO' },
  { id: 'D0', name: 'RX<-0', x: 345, y: 353, mode: 'IO' },
].map((p, i) => ({ ...p, number: i } as any))

export default function WiringPlayground() {
  const project = useProjectStore((s) => s.project)
  const boardId = project?.settings?.boardId || 'esp32-devkit-v1'
  const svgRef = useRef<SVGSVGElement>(null)
  const moveComponent = useProjectStore((s) => s.moveComponent)
  const addWire = useProjectStore((s) => s.addWire)
  const removeWire = useProjectStore((s) => s.removeWire)
  const removeComponent = useProjectStore((s) => s.removeComponent)
  const selection = useUIStore((s) => s.selection)
  const setSelection = useUIStore((s) => s.setSelection)
  const zoom = useUIStore((s) => s.zoom)
  const panX = useUIStore((s) => s.panX)
  const panY = useUIStore((s) => s.panY)
  const setZoom = useUIStore((s) => s.setZoom)
  const setPan = useUIStore((s) => s.setPan)
  const simSnapshot = useSimulationStore((s) => s.snapshot)
  const simState = useSimulationStore((s) => s.state)

  const [drag, setDrag] = useState<DragState | null>(null)
  const [wireDraw, setWireDraw] = useState<WireDrawState | null>(null)
  const [hoveredPin, setHoveredPin] = useState<PinWorldPos | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleContainerMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }, [])

  const getTooltipContent = useCallback(() => {
    if (!hoveredPin) return null

    const { componentId, pinId } = hoveredPin
    let compName = ''
    let pinMode = 'FLOATING'
    let voltage = 0
    let capabilities: string[] = []
    let connections: string[] = []

    // 1. Resolve Component Name & Pin Mode
    if (componentId === 'board') {
      compName = boardId === 'esp32-devkit-v1' ? 'ESP32 DevKit' : 'Arduino Uno'
      const boardPin = (boardId === 'esp32-devkit-v1' ? ESP32_PINS : UNO_PINS).find(p => p.id === pinId)
      pinMode = boardPin?.mode || 'GND'
      
      // Capabilities
      if (boardId === 'arduino-uno') {
        if (['D3', 'D5', 'D6', 'D9', 'D10', 'D11'].includes(pinId)) capabilities.push('PWM')
        if (['D2', 'D3'].includes(pinId)) capabilities.push('INT')
        if (['A4', 'A5', 'SDA', 'SCL'].includes(pinId)) capabilities.push('I2C')
        if (['D10', 'D11', 'D12', 'D13'].includes(pinId)) capabilities.push('SPI')
      } else {
        // ESP32
        if (['GPIO21', 'GPIO22'].includes(pinId)) capabilities.push('I2C')
        if (['GPIO12', 'GPIO13', 'GPIO14', 'GPIO15'].includes(pinId)) capabilities.push('SPI')
        if (pinId.startsWith('GPIO')) capabilities.push('PWM')
      }
    } else {
      const comp = project?.components.find(c => c.id === componentId)
      compName = comp?.label || componentId
      const compDef = LIBRARY_COMPONENTS.find(d => d.id === comp?.definitionId)
      const pinDef = compDef?.pins.find(p => p.id === pinId)
      pinMode = pinDef?.mode || 'FLOATING'
    }

    // 2. Resolve Live Sim State & Connections
    const simPin = (simSnapshot as any)?.nets?.flatMap((n: any) => n.pins).find((p: any) => p.componentId === componentId && p.pinId === pinId)
    if (simPin) {
      voltage = simPin.value
    } else {
      // Default fallback
      const pinIdLower = pinId.toLowerCase()
      if (pinIdLower === 'gnd') voltage = 0
      else if (['vcc', '5v', '3v3', '3v3_1', '3v3_2'].includes(pinIdLower)) voltage = 3.3
    }

    const net = (simSnapshot as any)?.nets?.find((n: any) => n.pins.some((p: any) => p.componentId === componentId && p.pinId === pinId))
    if (net) {
      connections = net.pins
        .filter((p: any) => !(p.componentId === componentId && p.pinId === pinId))
        .map((p: any) => `${p.componentId === 'board' ? 'MCU' : p.componentId}:${p.pinId}`)
    }

    const state = voltage >= 1.5 ? 'HIGH' : 'LOW'

    return (
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center border-b border-border/60 pb-1 shrink-0">
          <span className="font-bold text-text-primary text-xs">{pinId}</span>
          <span className="text-[10px] text-text-secondary uppercase">{compName}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
          <span className="text-text-secondary">Mode:</span>
          <span className="text-text-primary font-semibold">{pinMode}</span>
          
          <span className="text-text-secondary">Voltage:</span>
          <span className="text-text-primary font-semibold">{voltage.toFixed(2)} V</span>

          <span className="text-text-secondary">State:</span>
          <span className={`font-semibold ${state === 'HIGH' ? 'text-success' : 'text-text-secondary'}`}>{state}</span>
        </div>

        {capabilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 shrink-0">
            {capabilities.map(cap => (
              <span key={cap} className="px-1 py-0.5 rounded bg-accent/10 text-accent font-semibold text-[8px] tracking-wider">{cap}</span>
            ))}
          </div>
        )}

        {connections.length > 0 && (
          <div className="border-t border-border/40 pt-1.5 mt-1 shrink-0">
            <div className="text-[9px] text-text-secondary mb-0.5">Connected to:</div>
            <div className="text-[9px] text-text-primary truncate max-w-full font-semibold">
              {connections.join(', ')}
            </div>
          </div>
        )}
      </div>
    )
  }, [hoveredPin, boardId, project, simSnapshot])

  const getSvgPoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current
      if (!svg) return { x: 0, y: 0 }
      const rect = svg.getBoundingClientRect()
      return {
        x: (clientX - rect.left - panX) / zoom,
        y: (clientY - rect.top - panY) / zoom,
      }
    },
    [zoom, panX, panY],
  )

  const getPinWorldPos = useCallback(
    (comp: ComponentInstance | string, pinId: string): PinWorldPos | null => {
      if (comp === 'board' || (typeof comp === 'string' && comp === 'board')) {
        const boardPins = boardId === 'esp32-devkit-v1' ? ESP32_PINS : UNO_PINS
        const pin = boardPins.find((p) => p.id === pinId || p.name === pinId || p.id.toLowerCase() === pinId.toLowerCase() || p.name.toLowerCase() === pinId.toLowerCase())
        if (!pin) return null
        return {
          componentId: 'board',
          pinId,
          x: 40 + pin.x,
          y: 40 + pin.y,
        }
      }
      const component = typeof comp === 'string' ? project?.components.find(c => c.id === comp) : comp
      if (!component) return null
      const def = getComponentDef(component.definitionId === 'dht22' ? 'dht11' : component.definitionId)
      if (!def) return null
      const pin = def.pins.find((p) => p.id === pinId)
      if (!pin) return null
      const rotated = rotatePoint(pin.x, pin.y, def.width / 2, def.height / 2, component.rotation || 0)
      return {
        componentId: component.id,
        pinId,
        x: component.x + rotated.x,
        y: component.y + rotated.y,
      }
    },
    [boardId, project],
  )

  const findNearestPin = useCallback(
    (wx: number, wy: number, excludeComponentId?: string): PinWorldPos | null => {
      if (!project) return null
      let nearest: PinWorldPos | null = null
      let minDist = PIN_HIT_RADIUS

      // Search components
      for (const comp of project.components) {
        if (comp.id === excludeComponentId) continue
        const def = getComponentDef(comp.definitionId === 'dht22' ? 'dht11' : comp.definitionId)
        if (!def) continue
        for (const pin of def.pins) {
          const rotated = rotatePoint(pin.x, pin.y, def.width / 2, def.height / 2, comp.rotation || 0)
          const px = comp.x + rotated.x
          const py = comp.y + rotated.y
          const dist = Math.hypot(px - wx, py - wy)
          if (dist < minDist) {
            minDist = dist
            nearest = { componentId: comp.id, pinId: pin.id, x: px, y: py }
          }
        }
      }

      // Search board pins
      if (excludeComponentId !== 'board') {
        const boardPins = boardId === 'esp32-devkit-v1' ? ESP32_PINS : UNO_PINS
        for (const pin of boardPins) {
          const px = 40 + pin.x
          const py = 40 + pin.y
          const dist = Math.hypot(px - wx, py - wy)
          if (dist < minDist) {
            minDist = dist
            nearest = { componentId: 'board', pinId: pin.id, x: px, y: py }
          }
        }
      }

      return nearest
    },
    [project, boardId],
  )

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const currentZoom = useUIStore.getState().zoom
      setZoom(Math.max(0.1, Math.min(currentZoom * delta, 5)))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
    }
  }, [setZoom])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        setIsPanning(true)
        setPanStart({ x: e.clientX - panX, y: e.clientY - panY })
        return
      }

      if (e.button === 0) {
        const pt = getSvgPoint(e.clientX, e.clientY)

        // Check board pins
        const boardPins = boardId === 'esp32-devkit-v1' ? ESP32_PINS : UNO_PINS
        for (const pin of boardPins) {
          const px = 40 + pin.x
          const py = 40 + pin.y
          if (Math.hypot(px - pt.x, py - pt.y) < PIN_HIT_RADIUS) {
            setWireDraw({
              fromComponentId: 'board',
              fromPinId: pin.id,
              fromX: px,
              fromY: py,
              currentX: px,
              currentY: py,
            })
            return
          }
        }

        for (const comp of project?.components ?? []) {
          const def = getComponentDef(comp.definitionId === 'dht22' ? 'dht11' : comp.definitionId)
          if (!def) continue
          for (const pin of def.pins) {
            const rotated = rotatePoint(pin.x, pin.y, def.width / 2, def.height / 2, comp.rotation || 0)
            const px = comp.x + rotated.x
            const py = comp.y + rotated.y
            if (Math.hypot(px - pt.x, py - pt.y) < PIN_HIT_RADIUS) {
              setWireDraw({
                fromComponentId: comp.id,
                fromPinId: pin.id,
                fromX: px,
                fromY: py,
                currentX: px,
                currentY: py,
              })
              return
            }
          }
        }

        for (const comp of project?.components ?? []) {
          const def = getComponentDef(comp.definitionId === 'dht22' ? 'dht11' : comp.definitionId)
          if (!def) continue
          if (
            pt.x >= comp.x &&
            pt.x <= comp.x + def.width &&
            pt.y >= comp.y &&
            pt.y <= comp.y + def.height
          ) {
            setDrag({
              componentId: comp.id,
              offsetX: pt.x - comp.x,
              offsetY: pt.y - comp.y,
            })
            setSelection({ type: 'component', id: comp.id })
            return
          }
        }

        setSelection(null)
      }
    },
    [project, getSvgPoint, panX, panY, setSelection, boardId],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan(e.clientX - panStart.x, e.clientY - panStart.y)
        return
      }

      if (drag) {
        const pt = getSvgPoint(e.clientX, e.clientY)
        moveComponent(
          drag.componentId,
          snapToGrid(pt.x - drag.offsetX),
          snapToGrid(pt.y - drag.offsetY),
        )
        return
      }

      if (wireDraw) {
        const pt = getSvgPoint(e.clientX, e.clientY)
        setWireDraw({ ...wireDraw, currentX: pt.x, currentY: pt.y })
        const nearest = findNearestPin(pt.x, pt.y, wireDraw.fromComponentId)
        setHoveredPin(nearest)
      } else {
        const pt = getSvgPoint(e.clientX, e.clientY)
        const nearest = findNearestPin(pt.x, pt.y)
        setHoveredPin(nearest)
      }
    },
    [isPanning, panStart, drag, wireDraw, getSvgPoint, moveComponent, setPan, findNearestPin],
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setIsPanning(false)
        return
      }

      if (drag) {
        setDrag(null)
        return
      }

      if (wireDraw) {
        const pt = getSvgPoint(e.clientX, e.clientY)
        const target = findNearestPin(pt.x, pt.y, wireDraw.fromComponentId)
        if (target) {
          const color = WIRE_COLORS[Math.floor(Math.random() * WIRE_COLORS.length)]
          const wire: WireConnection = {
            id: `wire-${Date.now()}`,
            from: { componentId: wireDraw.fromComponentId, pinId: wireDraw.fromPinId },
            to: { componentId: target.componentId, pinId: target.pinId },
            color,
            points: [
              { x: wireDraw.fromX, y: wireDraw.fromY },
              { x: target.x, y: target.y },
            ],
          }
          addWire(wire)
        }
        setWireDraw(null)
        setHoveredPin(null)
      }
    },
    [isPanning, drag, wireDraw, getSvgPoint, findNearestPin, addWire],
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const sel = useUIStore.getState().selection
        if (sel && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          if (sel.type === 'component') removeComponent(sel.id)
          else if (sel.type === 'wire') removeWire(sel.id)
          setSelection(null)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [removeComponent, removeWire, setSelection])

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary text-sm">
        No project loaded
      </div>
    )
  }

  return (
    <div className="h-full w-full relative overflow-hidden bg-bg-primary" tabIndex={0} onMouseMove={handleContainerMouseMove}>
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button
          onClick={() => setZoom(zoom * 1.2)}
          className="w-7 h-7 bg-bg-secondary border border-border rounded text-text-secondary hover:text-text-primary text-xs flex items-center justify-center transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setZoom(zoom / 1.2)}
          className="w-7 h-7 bg-bg-secondary border border-border rounded text-text-secondary hover:text-text-primary text-xs flex items-center justify-center transition-colors"
        >
          −
        </button>
        <button
          onClick={() => {
            setZoom(1)
            setPan(0, 0)
          }}
          className="px-2 h-7 bg-bg-secondary border border-border rounded text-text-secondary hover:text-text-primary text-xs flex items-center justify-center transition-colors"
        >
          Fit
        </button>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isPanning ? 'grabbing' : drag ? 'move' : hoveredPin ? 'crosshair' : 'default' }}
      >
        <defs>
          {/* Minor Grid (every 20px) */}
          <pattern
            id="grid-minor"
            width={GRID_SIZE}
            height={GRID_SIZE}
            patternUnits="userSpaceOnUse"
          >
            <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="currentColor" className="text-border" strokeWidth={0.5} opacity={0.12} />
          </pattern>

          {/* Major Grid (every 100px) */}
          <pattern
            id="grid-major"
            width={GRID_SIZE * 5}
            height={GRID_SIZE * 5}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${panX % (GRID_SIZE * 5 * zoom)}, ${panY % (GRID_SIZE * 5 * zoom)}) scale(${zoom})`}
          >
            <rect width={GRID_SIZE * 5} height={GRID_SIZE * 5} fill="url(#grid-minor)" />
            <path d={`M ${GRID_SIZE * 5} 0 L 0 0 0 ${GRID_SIZE * 5}`} fill="none" stroke="currentColor" className="text-border" strokeWidth={1} opacity={0.35} />
          </pattern>

          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.2" />
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid-major)" />

        <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
          <g transform="translate(20, 20)">
            <BoardRenderer boardId={boardId} pins={boardId === 'esp32-devkit-v1' ? ESP32_PINS : UNO_PINS} />
          </g>

          {project.wires.map((wire) => {
            const fromId = wire.from?.componentId || (wire as any).sourceComponentId
            const fromPin = wire.from?.pinId || (wire as any).sourcePinId
            const toId = wire.to?.componentId || (wire as any).targetComponentId
            const toPin = wire.to?.pinId || (wire as any).targetPinId
            if (!fromId || !fromPin || !toId || !toPin) return null

            const fromComp = fromId === 'board' ? 'board' : project.components.find((c) => c.id === fromId)
            const toComp = toId === 'board' ? 'board' : project.components.find((c) => c.id === toId)
            if (!fromComp || !toComp) return null

            const fromPos = getPinWorldPos(fromComp, fromPin)
            const toPos = getPinWorldPos(toComp, toPin)
            if (!fromPos || !toPos) return null

            const isSelected = selection?.type === 'wire' && selection.id === wire.id

            // Resolve net state from simulation snapshot
            const net = (simSnapshot as any)?.nets?.find((n: any) =>
              n.pins.some((p: any) => p.componentId === fromId && p.pinId === fromPin) ||
              n.pins.some((p: any) => p.componentId === toId && p.pinId === toPin)
            )

            let wireColor = wire.color || '#22C55E'
            let glow = false
            let dashed = false
            let flashing = false

            if (simState === 'running' && net) {
              if (net.state === 'HIGH') {
                wireColor = '#10B981' // Neon green
                glow = true
                
                // Check if connected to a PWM pin
                const isPwm = ['D3', 'D5', 'D6', 'D9', 'D10', 'D11', 'GPIO18', 'GPIO19', 'GPIO21', 'GPIO22', 'GPIO23', 'GPIO25'].includes(fromPin) || 
                              fromPin.toLowerCase().includes('pwm') || toPin.toLowerCase().includes('pwm')
                if (isPwm) {
                  dashed = true
                }
              } else if (net.state === 'LOW') {
                wireColor = '#4B5563' // Muted dark gray
              } else if (net.state === 'CONFLICT') {
                wireColor = '#EF4444' // Red
                glow = true
                flashing = true
              } else if (net.state === 'FLOATING') {
                wireColor = '#F59E0B' // Orange
              }
            }

            return (
              <WireRenderer
                key={wire.id}
                points={[{ x: fromPos.x, y: fromPos.y }, { x: toPos.x, y: toPos.y }]}
                color={wireColor}
                selected={isSelected}
                glow={glow}
                dashed={dashed}
                flashing={flashing}
                onClick={() => setSelection({ type: 'wire', id: wire.id })}
              />
            )
          })}

          {wireDraw && (
            <>
              <line
                x1={wireDraw.fromX}
                y1={wireDraw.fromY}
                x2={wireDraw.currentX}
                y2={wireDraw.currentY}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="4 4"
                pointerEvents="none"
              />
              <circle
                cx={wireDraw.fromX}
                cy={wireDraw.fromY}
                r={6}
                fill="#3b82f6"
                opacity={0.5}
                pointerEvents="none"
              />
            </>
          )}

          {project.components.map((comp) => {
            const def = getComponentDef(comp.definitionId === 'dht22' ? 'dht11' : comp.definitionId)
            if (!def) return null

            const isSelected =
              selection?.type === 'component' && selection.id === comp.id

            const deviceState = (simSnapshot as any)?.componentStates?.[comp.id] || {}
            const isOn = Boolean(deviceState.on)
            const angle = deviceState.angle !== undefined ? Number(deviceState.angle) : undefined
            const pressed = deviceState.pressed !== undefined ? Boolean(deviceState.pressed) : undefined
            const position = deviceState.position !== undefined ? Number(deviceState.position) : undefined
            const text = deviceState.text !== undefined ? String(deviceState.text) : undefined
            const active = deviceState.active !== undefined ? Boolean(deviceState.active) : undefined
            const frequency = deviceState.frequency !== undefined ? Number(deviceState.frequency) : undefined
            const distance = deviceState.distance !== undefined ? Number(deviceState.distance) : undefined
            const brightness = deviceState.brightness !== undefined ? Number(deviceState.brightness) : undefined
            const motion = deviceState.motion !== undefined ? Boolean(deviceState.motion) : undefined
            const r = deviceState.r !== undefined ? Number(deviceState.r) : undefined
            const g = deviceState.g !== undefined ? Number(deviceState.g) : undefined
            const b = deviceState.b !== undefined ? Number(deviceState.b) : undefined

            return (
              <g
                key={comp.id}
                transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation}, ${def.width / 2}, ${def.height / 2})`}
                className="cursor-move"
                filter="url(#shadow)"
              >
                {isSelected && (
                  <rect
                    x={-4}
                    y={-4}
                    width={def.width + 8}
                    height={def.height + 8}
                    rx={8}
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    opacity={0.8}
                    pointerEvents="none"
                  />
                )}

                <rect
                  width={def.width}
                  height={def.height}
                  rx={6}
                  fill={isSelected ? 'var(--color-bg-hover)' : 'var(--color-bg-secondary)'}
                  stroke={isSelected ? 'var(--color-accent)' : 'var(--color-border)'}
                  strokeWidth={isSelected ? 1.5 : 1}
                />

                <ComponentRenderer
                  definitionId={comp.definitionId === 'dht22' ? 'dht11' : comp.definitionId}
                  x={def.width / 2}
                  y={def.height / 2}
                  on={isOn}
                  color={comp.properties?.color as string}
                  angle={angle}
                  pressed={pressed}
                  position={position}
                  text={text}
                  active={active}
                  frequency={frequency}
                  distance={distance}
                  brightness={brightness}
                  motion={motion}
                  r={r}
                  g={g}
                  b={b}
                />

                <text
                  x={def.width / 2}
                  y={def.height - 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#a0a0a0"
                  fontSize={8}
                  fontFamily="system-ui, sans-serif"
                  pointerEvents="none"
                >
                  {comp.label}
                </text>

                {def.pins.map((pin) => {
                  const isPinHovered =
                    hoveredPin?.componentId === comp.id && hoveredPin?.pinId === pin.id
                  const isPinSelected =
                    selection?.type === 'pin' &&
                    selection.id === `${comp.id}:${pin.id}`

                  return (
                    <PinRenderer
                      key={pin.id}
                      x={pin.x}
                      y={pin.y}
                      mode={pin.mode as PinMode}
                      selected={isPinSelected}
                      highlighted={isPinHovered}
                      label={pin.name}
                      radius={5}
                      onClick={() => {
                        setSelection({
                          type: 'pin',
                          id: `${comp.id}:${pin.id}`,
                        })
                      }}
                    />
                  )
                })}
              </g>
            )
          })}
        </g>
      </svg>

      {project.components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-text-secondary">
            <p className="text-sm mb-1">No components on the canvas</p>
            <p className="text-xs">Open the Components panel to add parts</p>
          </div>
        </div>
      )}
      {hoveredPin && (
        <div 
          className="fixed z-50 pointer-events-none bg-[#09090d]/95 border border-border/80 rounded-lg p-3 shadow-xl text-text-primary text-[11px] font-mono w-56 flex flex-col gap-1.5 backdrop-blur-sm"
          style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
        >
          {getTooltipContent()}
        </div>
      )}

      {/* Viewport coordinate HUD */}
      <div className="absolute bottom-2 left-2 z-10 bg-[#09090d]/85 border border-border/80 px-2.5 py-1 rounded text-[9px] font-mono text-text-secondary select-none pointer-events-none flex gap-3 shadow-md backdrop-blur-sm">
        <span>X: {Math.round(-panX)}px</span>
        <span>Y: {Math.round(-panY)}px</span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
      </div>
    </div>
  )
}
