import { type ReactNode, useCallback, useState } from 'react'
import { Link } from 'react-router'
import { useProjectStore, useUIStore, useSimulationStore } from '../lib/stores'
import { getSimulationBridge } from '../lib/simulationWorker'
import SettingsModal from './SettingsModal'
import {
  IconSun,
  IconMoon,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLayoutBottombarCollapse,
  IconLayoutBottombarExpand,
  IconSettings,
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipForward,
  IconPlayerStop,
  IconArrowLeft,
} from '@tabler/icons-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const project = useProjectStore((s) => s.project)
  const isDirty = useProjectStore((s) => s.isDirty)
  const save = useProjectStore((s) => s.save)
  const undo = useProjectStore((s) => s.undo)
  const redo = useProjectStore((s) => s.redo)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const bottomPanelOpen = useUIStore((s) => s.bottomPanelOpen)
  const toggleBottomPanel = useUIStore((s) => s.toggleBottomPanel)
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

  // Simulation Timeline states
  const history = useSimulationStore((s) => s.history)
  const historyIndex = useSimulationStore((s) => s.historyIndex)
  const setHistoryIndex = useSimulationStore((s) => s.setHistoryIndex)
  const simState = useSimulationStore((s) => s.state)
  const simSpeed = useSimulationStore((s) => s.config.speed)
  const start = useSimulationStore((s) => s.start)
  const pause = useSimulationStore((s) => s.pause)
  const resume = useSimulationStore((s) => s.resume)
  const step = useSimulationStore((s) => s.step)
  const reset = useSimulationStore((s) => s.reset)
  const setSpeed = useSimulationStore((s) => s.setSpeed)

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleStart = useCallback(() => {
    const activeFileId = useUIStore.getState().activeFileId
    const file = project?.files.find((f) => f.id === activeFileId)
    const code = file?.content || ''
    
    start()
    getSimulationBridge().start(code)
  }, [start, project])

  const handlePause = useCallback(() => {
    pause()
    getSimulationBridge().pause()
  }, [pause])

  const handleResume = useCallback(() => {
    resume()
    getSimulationBridge().resume()
  }, [resume])

  const handleStep = useCallback(() => {
    step()
    getSimulationBridge().step()
  }, [step])

  const handleReset = useCallback(() => {
    reset()
    getSimulationBridge().reset()
  }, [reset])

  const handleSpeedChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const speed = Number(e.target.value)
      setSpeed(speed)
    },
    [setSpeed],
  )

  return (
    <div className="h-screen flex flex-col bg-bg-primary transition-colors duration-200">
      <nav className="h-12 border-b border-border bg-bg-secondary flex items-center px-4 gap-3 shrink-0 backdrop-blur-md bg-opacity-95 shadow-sm">
        <Link to="/" className="flex items-center gap-2 mr-3 group">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-white font-bold text-xs shadow-md shadow-accent/20">
            R
          </div>
          <span className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
            RakitIO
          </span>
        </Link>

        <div className="h-4 w-px bg-border mx-1" />

        <Link
          to="/dashboard"
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-text-secondary hover:text-accent rounded transition-all cursor-pointer"
          title="Back to Dashboard"
        >
          <IconArrowLeft size={14} />
          Dashboard
        </Link>

        {project && (
          <>
            <span className="text-sm font-medium text-text-secondary truncate max-w-48">
              {project.name}
            </span>
            {isDirty && <span className="text-warning text-xs animate-pulse">●</span>}

            <div className="h-4 w-px bg-border mx-1" />

            <button
              onClick={() => save()}
              disabled={!isDirty}
              className="px-2.5 py-1 text-xs font-medium text-text-secondary hover:text-text-primary bg-bg-primary hover:bg-bg-hover border border-border rounded disabled:opacity-40 transition-all cursor-pointer"
              title="Save (Ctrl+S)"
            >
              Save
            </button>
            <button
              onClick={undo}
              className="px-2.5 py-1 text-xs font-medium text-text-secondary hover:text-text-primary bg-bg-primary hover:bg-bg-hover border border-border rounded transition-all cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              Undo
            </button>
            <button
              onClick={redo}
              className="px-2.5 py-1 text-xs font-medium text-text-secondary hover:text-text-primary bg-bg-primary hover:bg-bg-hover border border-border rounded transition-all cursor-pointer"
              title="Redo (Ctrl+Shift+Z)"
            >
              Redo
            </button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Simulation Controls */}
            <div className="flex items-center gap-1.5 bg-bg-primary/45 px-2 py-1 rounded border border-border/80 shadow-inner">
              {simState === 'idle' || simState === 'error' ? (
                <button
                  onClick={handleStart}
                  className="px-2 py-0.5 bg-success hover:bg-success/90 text-white text-[10px] rounded font-semibold shadow-sm transition-all active:scale-[0.98] flex items-center gap-1 cursor-pointer font-sans"
                  title="Start simulation"
                >
                  <IconPlayerPlay size={10} /> Start
                </button>
              ) : simState === 'running' ? (
                <button
                  onClick={handlePause}
                  className="px-2 py-0.5 bg-warning hover:bg-warning/90 text-white text-[10px] rounded font-semibold shadow-sm transition-all active:scale-[0.98] flex items-center gap-1 cursor-pointer font-sans"
                  title="Pause simulation"
                >
                  <IconPlayerPause size={10} /> Pause
                </button>
              ) : simState === 'paused' ? (
                <button
                  onClick={handleResume}
                  className="px-2 py-0.5 bg-success hover:bg-success/90 text-white text-[10px] rounded font-semibold shadow-sm transition-all active:scale-[0.98] flex items-center gap-1 cursor-pointer font-sans"
                  title="Resume simulation"
                >
                  <IconPlayerPlay size={10} /> Resume
                </button>
              ) : null}

              <button
                onClick={handleStep}
                disabled={simState !== 'paused' && simState !== 'idle'}
                className="p-0.5 bg-bg-primary hover:bg-bg-hover border border-border text-text-secondary hover:text-text-primary text-[10px] rounded transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center"
                title="Step (execute one loop iteration)"
              >
                <IconPlayerSkipForward size={10} />
              </button>

              <button
                onClick={handleReset}
                disabled={simState === 'idle'}
                className="p-0.5 bg-bg-primary hover:bg-bg-hover border border-border text-text-secondary hover:text-text-primary text-[10px] rounded transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center"
                title="Reset simulation"
              >
                <IconPlayerStop size={10} />
              </button>

              <select
                value={simSpeed}
                onChange={handleSpeedChange}
                className="bg-bg-primary border border-border rounded px-1 py-0.5 text-[9px] text-text-primary outline-none focus:border-accent cursor-pointer font-mono"
              >
                <option value={0.25}>0.25x</option>
                <option value={0.5}>0.5x</option>
                <option value={1}>1.0x</option>
                <option value={2}>2.0x</option>
                <option value={4}>4.0x</option>
              </select>
            </div>
          </>
        )}

        {/* Simulation Timeline (Scrubber) */}
        {simState !== 'idle' && history.length > 1 && (
          <div className="flex-1 max-w-md mx-6 flex items-center gap-3 bg-bg-primary/50 border border-border px-3 py-1 rounded-lg">
            <span className="text-[10px] font-mono text-text-secondary whitespace-nowrap">Timeline</span>
            <input
              type="range"
              min={0}
              max={history.length - 1}
              value={historyIndex}
              onChange={(e) => setHistoryIndex(parseInt(e.target.value, 10))}
              className="flex-1 h-1 bg-bg-hover rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <span className="text-[10px] font-mono text-text-primary whitespace-nowrap">
              {historyIndex + 1}/{history.length}
            </span>
          </div>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-border hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-all cursor-pointer flex items-center justify-center"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border border-transparent hover:border-border"
            title="Settings"
          >
            <IconSettings size={14} />
            Settings
          </button>

          <div className="h-4 w-px bg-border mx-1" />
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-all cursor-pointer flex items-center justify-center"
            title="Toggle sidebar"
          >
            {sidebarOpen ? <IconLayoutSidebarLeftCollapse size={16} /> : <IconLayoutSidebarLeftExpand size={16} />}
          </button>
          <button
            onClick={toggleBottomPanel}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-all cursor-pointer flex items-center justify-center"
            title="Toggle bottom panel"
          >
            {bottomPanelOpen ? <IconLayoutBottombarCollapse size={16} /> : <IconLayoutBottombarExpand size={16} />}
          </button>
        </div>
      </nav>

      <div className="flex-1 flex min-h-0">{children}</div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}
