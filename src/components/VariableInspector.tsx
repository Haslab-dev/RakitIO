import { useSimulationStore } from '../lib/stores'

export default function VariableInspector() {
  const variables = useSimulationStore((s) => s.variables)
  const callStack = useSimulationStore((s) => s.callStack)
  const simState = useSimulationStore((s) => s.state)

  if (simState === 'idle') {
    return (
      <div className="p-4 text-xs text-text-secondary italic text-center">
        Start the simulation to inspect variables.
      </div>
    )
  }

  const hasGlobals = variables.globals && Object.keys(variables.globals).length > 0
  const hasLocals = variables.locals && Object.keys(variables.locals).length > 0
  const hasRegisters = variables.registers && Object.keys(variables.registers).length > 0

  return (
    <div className="p-4 space-y-4 font-mono text-xs">
      {/* Call Stack */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider border-b border-border pb-1">
          Call Stack
        </div>
        {callStack.length > 0 ? (
          <div className="space-y-1 pl-1.5 border-l-2 border-accent">
            {callStack.map((frame, idx) => (
              <div key={idx} className={`${idx === callStack.length - 1 ? 'text-text-primary font-bold' : 'text-text-secondary'}`}>
                {idx === callStack.length - 1 ? '👉 ' : '   '}
                {frame}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-text-secondary italic pl-1">Global Scope</div>
        )}
      </div>

      {/* Local Variables */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider border-b border-border pb-1">
          Locals ({variables.fnName || 'global'})
        </div>
        {hasLocals ? (
          <div className="grid grid-cols-2 gap-y-1 pl-1 text-[11px]">
            {Object.entries(variables.locals).map(([k, v]) => (
              <div key={k} className="contents">
                <span className="text-text-secondary">{k}</span>
                <span className="text-accent font-bold">{JSON.stringify(v)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-text-secondary italic pl-1">No local variables</div>
        )}
      </div>

      {/* VM Registers */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider border-b border-border pb-1">
          VM Registers
        </div>
        {hasRegisters ? (
          <div className="grid grid-cols-3 gap-1 pl-1 text-[10px]">
            {Object.entries(variables.registers).map(([k, v]) => (
              <div key={k} className="bg-bg-tertiary px-1.5 py-0.5 rounded border border-border flex justify-between">
                <span className="text-text-secondary">{k}:</span>
                <span className="text-text-primary font-bold">{JSON.stringify(v)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-text-secondary italic pl-1">No active registers</div>
        )}
      </div>

      {/* Global Variables */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider border-b border-border pb-1">
          Globals
        </div>
        {hasGlobals ? (
          <div className="grid grid-cols-2 gap-y-1 pl-1 text-[11px]">
            {Object.entries(variables.globals).map(([k, v]) => (
              <div key={k} className="contents">
                <span className="text-text-secondary">{k}</span>
                <span className="text-indigo-400 font-bold">{JSON.stringify(v)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-text-secondary italic pl-1">No global variables</div>
        )}
      </div>
    </div>
  )
}
