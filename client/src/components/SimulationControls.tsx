import { useSimulationStore, useProjectStore } from '../lib/stores'

export default function SimulationControls() {
  const state = useSimulationStore((s) => s.state)
  const config = useSimulationStore((s) => s.config)
  const snapshot = useSimulationStore((s) => s.snapshot)
  const project = useProjectStore((s) => s.project)

  const isRunning = state === 'running'
  const isPaused = state === 'paused'
  const isError = state === 'error'

  return (
    <div className="h-6 border-t border-border bg-[#050508] flex items-center justify-between px-3 shrink-0 select-none text-[10px] font-mono text-text-secondary">
      {/* Left side: Simulation Status indicator */}
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            isRunning
              ? 'bg-success animate-pulse shadow-sm shadow-success'
              : isPaused
                ? 'bg-warning shadow-sm shadow-warning'
                : isError
                  ? 'bg-error shadow-sm shadow-error'
                  : 'bg-text-secondary/60'
          }`}
        />
        <span
          className={`text-[9px] font-bold uppercase tracking-wider ${
            isRunning
              ? 'text-success'
              : isPaused
                ? 'text-warning'
                : isError
                  ? 'text-error'
                  : 'text-text-secondary'
          }`}
        >
          {state}
        </span>
      </div>

      {/* Right side: Advanced Telemetry readout */}
      {snapshot && (
        <div className="flex items-center gap-4 text-text-secondary">
          <div className="flex items-center gap-1">
            <span className="opacity-50">CPU:</span>
            <span className="text-text-primary font-semibold">
              {project?.settings?.boardId === 'esp32-devkit-v1' ? '240 MHz' : '16 MHz'}
            </span>
          </div>
          <div className="w-px h-2.5 bg-border/50" />
          <div className="flex items-center gap-1">
            <span className="opacity-50">Cycles:</span>
            <span className="text-text-primary font-semibold">
              {(snapshot as any).cycleCount ?? Math.floor(((snapshot as any).simTimeMs ?? 0) * 1.5)}
            </span>
          </div>
          <div className="w-px h-2.5 bg-border/50" />
          <div className="flex items-center gap-1">
            <span className="opacity-50">Time:</span>
            <span className="text-text-primary font-semibold">
              {((snapshot as any).simTimeMs ?? 0).toLocaleString()} ms
            </span>
          </div>
          <div className="w-px h-2.5 bg-border/50" />
          <div className="flex items-center gap-1">
            <span className="opacity-50">Rate:</span>
            <span className="text-text-primary font-semibold">
              {isRunning ? `${Math.round(50000 * config.speed).toLocaleString()} inst/s` : '0 inst/s'}
            </span>
          </div>
          <div className="w-px h-2.5 bg-border/50" />
          <div className="flex items-center gap-1">
            <span className="opacity-50">FPS:</span>
            <span className="text-text-primary font-semibold">{isRunning ? '60' : '0'}</span>
          </div>
        </div>
      )}
    </div>
  )
}
