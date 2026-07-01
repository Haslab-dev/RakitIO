import { useCallback } from 'react'
import { useProjectStore, useUIStore, useSimulationStore } from '../lib/stores'
import { getSimulationBridge } from '../lib/simulationWorker'
import { IconCpu, IconActivity, IconDatabase, IconBolt, IconTrash } from '@tabler/icons-react'

// Simple schema registry for devices
const DEVICE_SCHEMAS: Record<string, Record<string, { type: 'slider' | 'button'; label: string; min?: number; max?: number; step?: number }>> = {
  bme280: {
    temperature: { type: 'slider', label: 'Temperature', min: -40, max: 85, step: 0.1 },
    humidity: { type: 'slider', label: 'Humidity', min: 0, max: 100, step: 1 },
    pressure: { type: 'slider', label: 'Pressure', min: 300, max: 1100, step: 1 },
  },
  dht11: {
    temperature: { type: 'slider', label: 'Temperature', min: -20, max: 60, step: 0.1 },
    humidity: { type: 'slider', label: 'Humidity', min: 0, max: 100, step: 1 },
  },
  dht22: {
    temperature: { type: 'slider', label: 'Temperature', min: -40, max: 80, step: 0.1 },
    humidity: { type: 'slider', label: 'Humidity', min: 0, max: 100, step: 1 },
  },
  potentiometer: {
    position: { type: 'slider', label: 'Wiper Position', min: 0, max: 1, step: 0.01 },
  },
  button: {
    pressed: { type: 'button', label: 'Press Button' },
  },
  ultrasonic: {
    distance: { type: 'slider', label: 'Distance', min: 2, max: 400, step: 1 },
  },
}

export default function DeviceInspector() {
  const selection = useUIStore((s) => s.selection)
  const project = useProjectStore((s) => s.project)
  const removeComponent = useProjectStore((s) => s.removeComponent)

  const simState = useSimulationStore((s) => s.state)
  const simSpeed = useSimulationStore((s) => s.config.speed)
  const simSnapshot = useSimulationStore((s) => s.snapshot)

  const selectedComponent = project?.components.find(c => c.id === selection?.id)

  const handlePropertyChange = useCallback((propName: string, value: any) => {
    if (!selectedComponent) return

    // 1. Update project store
    const updatedProps = { ...selectedComponent.properties, [propName]: value }
    useProjectStore.setState((s) => {
      if (!s.project) return {}
      const components = s.project.components.map(c =>
        c.id === selectedComponent.id ? { ...c, properties: updatedProps } : c
      )
      return { project: { ...s.project, components }, isDirty: true }
    })

    // 2. Push interaction to running simulation worker
    getSimulationBridge().interact(selectedComponent.id, propName, value)
  }, [selectedComponent])

  // Render Dashboard if no component is selected
  if (!selectedComponent) {
    if (!project) return null

    const boardId = project.settings?.boardId || 'arduino-uno'
    const isUno = boardId === 'arduino-uno'
    const boardName = isUno ? 'Arduino Uno R3' : 'ESP32 DevKit V1'
    const mcuName = isUno ? 'ATmega328P' : 'ESP32-WROOM-32'
    const flashMax = isUno ? 32 : 4096 // KB
    const sramMax = isUno ? 2 : 520 // KB

    // Mock program size based on board type
    const flashUsed = isUno ? 14.8 : 842.3
    const sramUsed = isUno ? 0.65 : 48.2

    // Pins list for GPIO monitor
    const pinsList = isUno 
      ? ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5']
      : ['GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15', 'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19', 'GPIO21', 'GPIO22', 'GPIO23', 'GPIO25', 'GPIO26', 'GPIO27', 'GPIO32', 'GPIO33', 'GPIO34', 'GPIO35']

    const getPinVoltage = (pinId: string) => {
      const pinStates = (simSnapshot as any)?.pinStates
      return pinStates?.['board']?.[pinId] ?? 0.0
    }

    return (
      <div className="p-4 space-y-5 h-full overflow-y-auto min-h-0">
        {/* Project Info */}
        <div className="space-y-1">
          <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <IconCpu size={12} className="text-accent" /> Project & Board
          </div>
          <div className="bg-bg-tertiary border border-border rounded-lg p-3 space-y-2">
            <div>
              <div className="text-xs font-semibold text-text-primary">{project.name}</div>
              <div className="text-[10px] text-text-secondary">{project.description || 'No description'}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-[10px]">
              <div>
                <span className="text-text-secondary">Board:</span>
                <div className="font-semibold text-text-primary">{boardName}</div>
              </div>
              <div>
                <span className="text-text-secondary">MCU:</span>
                <div className="font-semibold text-text-primary">{mcuName}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Simulation State */}
        <div className="space-y-1">
          <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <IconActivity size={12} className="text-accent" /> Simulation
          </div>
          <div className="bg-bg-tertiary border border-border rounded-lg p-3 space-y-2 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Status:</span>
              <div className="flex items-center gap-1.5 font-semibold text-text-primary">
                <span className={`w-2 h-2 rounded-full ${
                  simState === 'running' ? 'bg-success animate-pulse' :
                  simState === 'paused' ? 'bg-warning' : 'bg-text-secondary/45'
                }`} />
                {simState.toUpperCase()}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Speed:</span>
              <span className="font-semibold text-text-primary font-mono">{simSpeed}x</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Virtual Time:</span>
              <span className="font-semibold text-text-primary font-mono">
                {(simSnapshot as any)?.simTimeMs !== undefined ? `${((simSnapshot as any).simTimeMs / 1000).toFixed(3)}s` : '0.000s'}
              </span>
            </div>
          </div>
        </div>

        {/* Memory */}
        <div className="space-y-1">
          <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <IconDatabase size={12} className="text-accent" /> Virtual Memory
          </div>
          <div className="bg-bg-tertiary border border-border rounded-lg p-3 space-y-3 text-[10px]">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-text-secondary">Flash Usage</span>
                <span className="text-text-primary font-mono">{flashUsed} KB / {flashMax} KB</span>
              </div>
              <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full" 
                  style={{ width: `${(flashUsed / flashMax) * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-text-secondary">SRAM Usage</span>
                <span className="text-text-primary font-mono">{sramUsed.toFixed(2)} KB / {sramMax} KB</span>
              </div>
              <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success rounded-full" 
                  style={{ width: `${(sramUsed / sramMax) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* GPIO Pin Monitor */}
        <div className="space-y-1">
          <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <IconBolt size={12} className="text-accent" /> GPIO Pin Monitor
          </div>
          <div className="bg-bg-tertiary border border-border rounded-lg p-2.5">
            <div className="grid grid-cols-4 gap-1.5">
              {pinsList.map((pinId) => {
                const volt = getPinVoltage(pinId)
                const isHigh = volt >= 1.5
                const isAnalog = volt > 0.1 && volt < 1.5
                
                return (
                  <div 
                    key={pinId} 
                    className={`p-1.5 rounded border text-[9px] flex flex-col items-center justify-center transition-all ${
                      isHigh ? 'bg-success/10 border-success/30 text-success' :
                      isAnalog ? 'bg-warning/10 border-warning/30 text-warning' :
                      'bg-bg-secondary border-border/50 text-text-secondary'
                    }`}
                  >
                    <span className="font-semibold font-mono">{pinId}</span>
                    <span className="font-mono opacity-80 text-[8px]">{volt.toFixed(1)}V</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const schema = DEVICE_SCHEMAS[selectedComponent.definitionId] || {}
  const componentProps = selectedComponent.properties || {}

  return (
    <div className="p-4 space-y-4">
      <div className="border-b border-border pb-2">
        <div className="text-xs font-semibold text-text-primary uppercase tracking-wider">{selectedComponent.label}</div>
        <div className="text-[10px] text-text-secondary font-mono">{selectedComponent.id}</div>
      </div>

      {/* Dynamic Schema Controls */}
      {schema ? (
        <div className="space-y-3">
          {Object.entries(schema).map(([key, config]) => {
            if (!config) return null
            const val = componentProps[key] ?? (config.type === 'slider' ? (config.min ?? 0) : false)

            if (config.type === 'slider') {
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>{config.label}</span>
                    <span className="text-accent font-bold font-mono">
                      {val}
                      {key === 'temperature' ? '°C' : key === 'humidity' ? '%' : key === 'pressure' ? ' hPa' : key === 'distance' ? ' cm' : ''}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={typeof val === 'number' ? val : 0}
                    onChange={(e) => handlePropertyChange(key, parseFloat(e.target.value))}
                    className="w-full h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>
              )
            }

            if (config.type === 'button') {
              return (
                <div key={key} className="pt-2">
                  <button
                    onMouseDown={() => handlePropertyChange(key, true)}
                    onMouseUp={() => handlePropertyChange(key, false)}
                    onTouchStart={() => handlePropertyChange(key, true)}
                    onTouchEnd={() => handlePropertyChange(key, false)}
                    className="w-full py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-[0.98] select-none cursor-pointer"
                  >
                    {config.label}
                  </button>
                </div>
              )
            }

            return null
          })}
        </div>
      ) : (
        <div className="text-xs text-text-secondary italic">
          No configurable properties for this component.
        </div>
      )}

      {/* Position & Actions */}
      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex gap-2 text-[10px] text-text-secondary font-mono">
          <span>X: {selectedComponent.x}px</span>
          <span>Y: {selectedComponent.y}px</span>
          <span>Rot: {selectedComponent.rotation}°</span>
        </div>
        <button
          onClick={() => removeComponent(selectedComponent.id)}
          className="w-full py-1.5 border border-red-500/30 hover:bg-red-500/10 text-red-500 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
        >
          <IconTrash size={12} />
          Delete Component
        </button>
      </div>
    </div>
  )
}
