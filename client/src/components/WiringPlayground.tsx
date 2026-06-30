import { useRef, useState, useCallback, useEffect } from 'react'
import { useProjectStore, useUIStore } from '../lib/stores'
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

export default function WiringPlayground() {
  const svgRef = useRef<SVGSVGElement>(null)
  const project = useProjectStore((s) => s.project)
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

  const [drag, setDrag] = useState<DragState | null>(null)
  const [wireDraw, setWireDraw] = useState<WireDrawState | null>(null)
  const [hoveredPin, setHoveredPin] = useState<PinWorldPos | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

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
    (comp: ComponentInstance, pinId: string): PinWorldPos | null => {
      const def = getComponentDef(comp.definitionId)
      if (!def) return null
      const pin = def.pins.find((p) => p.id === pinId)
      if (!pin) return null
      return {
        componentId: comp.id,
        pinId,
        x: comp.x + pin.x,
        y: comp.y + pin.y,
      }
    },
    [],
  )

  const findNearestPin = useCallback(
    (wx: number, wy: number, excludeComponentId?: string): PinWorldPos | null => {
      if (!project) return null
      let nearest: PinWorldPos | null = null
      let minDist = PIN_HIT_RADIUS

      for (const comp of project.components) {
        if (comp.id === excludeComponentId) continue
        const def = getComponentDef(comp.definitionId)
        if (!def) continue
        for (const pin of def.pins) {
          const px = comp.x + pin.x
          const py = comp.y + pin.y
          const dist = Math.hypot(px - wx, py - wy)
          if (dist < minDist) {
            minDist = dist
            nearest = { componentId: comp.id, pinId: pin.id, x: px, y: py }
          }
        }
      }
      return nearest
    },
    [project],
  )

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom(zoom * delta)
    },
    [zoom, setZoom],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        setIsPanning(true)
        setPanStart({ x: e.clientX - panX, y: e.clientY - panY })
        return
      }

      if (e.button === 0) {
        const pt = getSvgPoint(e.clientX, e.clientY)

        for (const comp of project?.components ?? []) {
          const def = getComponentDef(comp.definitionId)
          if (!def) continue
          for (const pin of def.pins) {
            const px = comp.x + pin.x
            const py = comp.y + pin.y
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
          const def = getComponentDef(comp.definitionId)
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
    [project, getSvgPoint, panX, panY, setSelection],
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

  const boardId = project.settings.boardId || 'arduino-uno'

  return (
    <div className="h-full w-full relative overflow-hidden bg-bg-primary" tabIndex={0}>
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
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isPanning ? 'grabbing' : drag ? 'move' : hoveredPin ? 'crosshair' : 'default' }}
      >
        <defs>
          <pattern
            id="grid"
            width={GRID_SIZE}
            height={GRID_SIZE}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${panX % (GRID_SIZE * zoom)}, ${panY % (GRID_SIZE * zoom)}) scale(${zoom})`}
          >
            <circle cx={GRID_SIZE / 2} cy={GRID_SIZE / 2} r="0.5" fill="#2a2a2a" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
          <g transform="translate(20, 20)">
            <BoardRenderer boardId={boardId} pins={[]} />
          </g>

          {project.wires.map((wire) => {
            const fromComp = project.components.find((c) => c.id === wire.from.componentId)
            const toComp = project.components.find((c) => c.id === wire.to.componentId)
            if (!fromComp || !toComp) return null

            const fromPos = getPinWorldPos(fromComp, wire.from.pinId)
            const toPos = getPinWorldPos(toComp, wire.to.pinId)
            if (!fromPos || !toPos) return null

            const isSelected = selection?.type === 'wire' && selection.id === wire.id

            return (
              <WireRenderer
                key={wire.id}
                points={[{ x: fromPos.x, y: fromPos.y }, { x: toPos.x, y: toPos.y }]}
                color={wire.color}
                selected={isSelected}
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
            const def = getComponentDef(comp.definitionId)
            if (!def) return null

            const isSelected =
              selection?.type === 'component' && selection.id === comp.id

            const simSnapshot = undefined
            const isOn = simSnapshot
              ? Boolean((simSnapshot as Record<string, unknown>).on)
              : false

            return (
              <g
                key={comp.id}
                transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation}, ${def.width / 2}, ${def.height / 2})`}
                className="cursor-move"
              >
                {isSelected && (
                  <rect
                    x={-4}
                    y={-4}
                    width={def.width + 8}
                    height={def.height + 8}
                    rx={6}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    opacity={0.6}
                    pointerEvents="none"
                  />
                )}

                <rect
                  width={def.width}
                  height={def.height}
                  rx={4}
                  fill={isSelected ? '#1e293b' : '#111111'}
                  stroke={isSelected ? '#3b82f6' : '#2a2a2a'}
                  strokeWidth={isSelected ? 2 : 1}
                />

                <ComponentRenderer
                  definitionId={comp.definitionId}
                  x={def.width / 2}
                  y={def.height / 2}
                  on={isOn}
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
    </div>
  )
}
