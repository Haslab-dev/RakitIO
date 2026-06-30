import { useEffect, useRef, useState } from 'react'
import { useSimulationStore } from '../lib/stores'

export default function SerialMonitor() {
  const serialOutput = useSimulationStore((s) => s.serialOutput)
  const clearSerial = useSimulationStore((s) => s.clearSerial)
  const endRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (autoScroll) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [serialOutput, autoScroll])

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30
    setAutoScroll(atBottom)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">
            {serialOutput.length} messages
          </span>
          <label className="flex items-center gap-1 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-3 h-3 accent-accent"
            />
            Auto-scroll
          </label>
        </div>
        <button
          onClick={clearSerial}
          className="text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          Clear
        </button>
      </div>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2 font-mono text-xs"
      >
        {serialOutput.length === 0 ? (
          <div className="text-text-secondary p-2">
            Serial output will appear here when the simulation is running.
          </div>
        ) : (
          serialOutput.map((line, i) => (
            <div key={i} className="text-text-primary leading-relaxed py-0.5">
              {line}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  )
}
