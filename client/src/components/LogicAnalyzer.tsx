import { useState, useMemo } from 'react'
import { useSimulationStore } from '../lib/stores'

interface WavePoint {
  time: number
  value: number
}

export default function LogicAnalyzer() {
  const events = useSimulationStore((s) => s.events)
  const simState = useSimulationStore((s) => s.state)

  const [probedPins, setProbedPins] = useState<string[]>(['13', 'SDA', 'SCL'])

  // Group pin change events by pin ID
  const waves = useMemo(() => {
    const map: Record<string, WavePoint[]> = {}
    
    // Initialize with start point
    for (const pin of probedPins) {
      map[pin] = [{ time: 0, value: 0 }]
    }

    const startTime = events[0]?.timestamp ?? Date.now()

    for (const ev of events) {
      if (ev.type === 'pin_change' && ev.pinId && probedPins.includes(ev.pinId)) {
        const time = (ev.timestamp - startTime) / 1000 // seconds since start
        const val = typeof ev.value === 'number' ? ev.value : ev.value ? 1 : 0
        
        // Push transition point (vertical line)
        const last = map[ev.pinId][map[ev.pinId].length - 1]
        if (last) {
          map[ev.pinId].push({ time, value: last.value }) // Keep previous value until this time
        }
        map[ev.pinId].push({ time, value: val })
      }
    }

    return map
  }, [events, probedPins])

  if (simState === 'idle') {
    return (
      <div className="p-4 text-xs text-text-secondary italic text-center">
        Start the simulation to capture logic analyzer waveforms.
      </div>
    )
  }

  const duration = Math.max(5, events.length > 0 ? (events[events.length - 1].timestamp - events[0].timestamp) / 1000 : 0)

  return (
    <div className="p-3 h-full flex flex-col bg-[#050508] border-t border-border font-mono text-xs text-text-secondary">
      <div className="flex items-center justify-between border-b border-border pb-1.5 mb-2 shrink-0">
        <span className="font-bold text-text-primary text-[10px] uppercase tracking-wider">Logic Analyzer</span>
        <div className="flex gap-2">
          {['13', 'SDA', 'SCL', '2'].map(pin => {
            const active = probedPins.includes(pin)
            return (
              <button
                key={pin}
                onClick={() => setProbedPins(prev => active ? prev.filter(p => p !== pin) : [...prev, pin])}
                className={`px-2 py-0.5 rounded text-[10px] border transition-all cursor-pointer ${
                  active ? 'bg-accent/20 border-accent text-accent' : 'border-border hover:bg-bg-hover text-text-secondary'
                }`}
              >
                PROBE {pin}
              </button>
            )
          })}
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="flex-1 overflow-x-auto min-h-0">
        <div className="h-full min-w-[600px] relative">
          <svg className="w-full h-full" viewBox={`0 0 600 ${probedPins.length * 50 + 20}`}>
            {/* Grid Lines */}
            {probedPins.map((_, idx) => (
              <g key={idx}>
                <line x1="40" y1={30 + idx * 50} x2="580" y2={30 + idx * 50} stroke="#1A1A24" strokeWidth="1" />
                <line x1="40" y1={10 + idx * 50} x2="580" y2={10 + idx * 50} stroke="#1A1A24" strokeWidth="0.5" strokeDasharray="2 2" />
              </g>
            ))}

            {/* Timestamps */}
            {Array.from({ length: 7 }, (_, i) => {
              const x = 40 + i * 90
              const time = ((i / 6) * duration).toFixed(2)
              return (
                <text key={i} x={x} y={probedPins.length * 50 + 15} fill="#475569" fontSize="8" textAnchor="middle">
                  {time}s
                </text>
              )
            })}

            {/* Channels & Waves */}
            {probedPins.map((pin, idx) => {
              const pts = waves[pin] || []
              const startY = 30 + idx * 50
              
              // Map time (0 to duration) to X (40 to 580)
              const getX = (t: number) => 40 + (duration > 0 ? (t / duration) * 540 : 0)
              
              // Map digital value (0 or 1) to Y (startY or startY - 20)
              const getY = (v: number) => startY - v * 20

              let pathD = ''
              if (pts.length > 0) {
                pathD = `M ${getX(pts[0].time)} ${getY(pts[0].value)}`
                for (let i = 1; i < pts.length; i++) {
                  pathD += ` L ${getX(pts[i].time)} ${getY(pts[i].value)}`
                }
                // Extend last point to end of timeline
                const last = pts[pts.length - 1]
                pathD += ` L 580 ${getY(last.value)}`
              }

              return (
                <g key={pin}>
                  {/* Channel Label */}
                  <text x="5" y={startY - 6} fill="#94A3B8" fontSize="9" fontWeight="bold">
                    {pin}
                  </text>

                  {/* Waveform line */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}
