import { useCallback } from 'react'
import { useSimulationStore } from '../lib/stores'

export default function SimulationControls() {
  const state = useSimulationStore((s) => s.state)
  const config = useSimulationStore((s) => s.config)
  const snapshot = useSimulationStore((s) => s.snapshot)
  const start = useSimulationStore((s) => s.start)
  const pause = useSimulationStore((s) => s.pause)
  const resume = useSimulationStore((s) => s.resume)
  const step = useSimulationStore((s) => s.step)
  const reset = useSimulationStore((s) => s.reset)
  const setSpeed = useSimulationStore((s) => s.setSpeed)

  const isRunning = state === 'running'
  const isPaused = state === 'paused'
  const isIdle = state === 'idle'
  const isError = state === 'error'

  const handleStart = useCallback(() => {
    start()
  }, [start])

  const handlePause = useCallback(() => {
    pause()
  }, [pause])

  const handleResume = useCallback(() => {
    resume()
  }, [resume])

  const handleStep = useCallback(() => {
    step()
  }, [step])

  const handleReset = useCallback(() => {
    reset()
  }, [reset])

  const handleSpeedChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSpeed(Number(e.target.value))
    },
    [setSpeed],
  )

  return (
    <div className="h-10 border-t border-border bg-bg-secondary flex items-center px-3 gap-2 shrink-0">
      <div className="flex items-center gap-1">
        {isIdle || isError ? (
          <button
            onClick={handleStart}
            className="px-3 py-1 bg-success/20 hover:bg-success/30 text-success text-xs rounded font-medium transition-colors flex items-center gap-1"
          >
            <span>▶</span> Start
          </button>
        ) : isRunning ? (
          <button
            onClick={handlePause}
            className="px-3 py-1 bg-warning/20 hover:bg-warning/30 text-warning text-xs rounded font-medium transition-colors flex items-center gap-1"
          >
            <span>⏸</span> Pause
          </button>
        ) : isPaused ? (
          <button
            onClick={handleResume}
            className="px-3 py-1 bg-success/20 hover:bg-success/30 text-success text-xs rounded font-medium transition-colors flex items-center gap-1"
          >
            <span>▶</span> Resume
          </button>
        ) : null}

        <button
          onClick={handleStep}
          disabled={!isPaused && !isIdle}
          className="px-2 py-1 bg-bg-tertiary hover:bg-bg-hover text-text-secondary text-xs rounded transition-colors disabled:opacity-40"
          title="Step (execute one loop iteration)"
        >
          ⏭
        </button>

        <button
          onClick={handleReset}
          disabled={isIdle}
          className="px-2 py-1 bg-bg-tertiary hover:bg-bg-hover text-text-secondary text-xs rounded transition-colors disabled:opacity-40"
          title="Reset simulation"
        >
          ⏹
        </button>
      </div>

      <div className="h-4 w-px bg-border mx-1" />

      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary">Speed:</span>
        <select
          value={config.speed}
          onChange={handleSpeedChange}
          className="bg-bg-tertiary border border-border rounded px-1.5 py-0.5 text-xs text-text-primary outline-none"
        >
          <option value={0.25}>0.25x</option>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
      </div>

      <div className="h-4 w-px bg-border mx-1" />

      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            isRunning
              ? 'bg-success animate-pulse'
              : isPaused
                ? 'bg-warning'
                : isError
                  ? 'bg-error'
                  : 'bg-text-secondary'
          }`}
        />
        <span
          className={`text-xs font-medium ${
            isRunning
              ? 'text-success'
              : isPaused
                ? 'text-warning'
                : isError
                  ? 'text-error'
                  : 'text-text-secondary'
          }`}
        >
          {state.charAt(0).toUpperCase() + state.slice(1)}
        </span>
      </div>

      <div className="flex-1" />

      {snapshot && (
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span>Cycle: {snapshot.cycleCount.toLocaleString()}</span>
          {Object.keys(snapshot.pinStates).length > 0 && (
            <span>Pins: {Object.keys(snapshot.pinStates).length}</span>
          )}
        </div>
      )}
    </div>
  )
}
