import { type ReactNode } from 'react'
import { Link } from 'react-router'
import { useProjectStore, useUIStore } from '../lib/stores'

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
  const activePanel = useUIStore((s) => s.activePanel)
  const setActivePanel = useUIStore((s) => s.setActivePanel)

  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      <nav className="h-10 border-b border-border bg-bg-secondary flex items-center px-3 gap-2 shrink-0">
        <Link to="/" className="flex items-center gap-2 mr-3 group">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-white font-bold text-xs">
            R
          </div>
          <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
            RakitIO
          </span>
        </Link>

        <div className="h-4 w-px bg-border mx-1" />

        {project && (
          <>
            <span className="text-sm text-text-secondary truncate max-w-48">
              {project.name}
            </span>
            {isDirty && <span className="text-warning text-xs">●</span>}

            <div className="h-4 w-px bg-border mx-1" />

            <button
              onClick={() => save()}
              disabled={!isDirty}
              className="px-2 py-0.5 text-xs text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
              title="Save (Ctrl+S)"
            >
              Save
            </button>
            <button
              onClick={undo}
              className="px-2 py-0.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
              title="Undo (Ctrl+Z)"
            >
              Undo
            </button>
            <button
              onClick={redo}
              className="px-2 py-0.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
              title="Redo (Ctrl+Shift+Z)"
            >
              Redo
            </button>
          </>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          {(['files', 'components', 'ai'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActivePanel(tab)}
              className={`px-2 py-0.5 text-xs capitalize rounded transition-colors ${activePanel === tab
                  ? 'bg-bg-hover text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              {tab}
            </button>
          ))}
          <div className="h-4 w-px bg-border mx-1" />
          <button
            onClick={toggleSidebar}
            className="px-2 py-0.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
            title="Toggle sidebar"
          >
            {sidebarOpen ? '◧' : '◨'}
          </button>
          <button
            onClick={toggleBottomPanel}
            className="px-2 py-0.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
            title="Toggle bottom panel"
          >
            {bottomPanelOpen ? '⬒' : '⬓'}
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-h-0">{children}</div>
    </div>
  )
}
