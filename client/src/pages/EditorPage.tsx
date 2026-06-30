import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router'
import { useProject } from '../lib/hooks/useApi'
import { useProjectStore, useUIStore, useSimulationStore } from '../lib/stores'
import Layout from '../components/Layout'
import MonacoEditor from '../components/MonacoEditor'
import ProjectExplorer from '../components/ProjectExplorer'
import ComponentLibrary from '../components/ComponentLibrary'
import AIChat from '../components/AIChat'
import WiringPlayground from '../components/WiringPlayground'
import SerialMonitor from '../components/SerialMonitor'
import SimulationControls from '../components/SimulationControls'

type MainTab = 'code' | 'wiring'

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useProject(id!)
  const setProject = useProjectStore((s) => s.setProject)
  const project = useProjectStore((s) => s.project)
  const activePanel = useUIStore((s) => s.activePanel)
  const activeFileId = useUIStore((s) => s.activeFileId)
  const setActiveFile = useUIStore((s) => s.setActiveFile)
  const bottomPanelOpen = useUIStore((s) => s.bottomPanelOpen)
  const toggleBottomPanel = useUIStore((s) => s.toggleBottomPanel)
  const activeBottomTab = useUIStore((s) => s.activeBottomTab)
  const setActiveBottomTab = useUIStore((s) => s.setActiveBottomTab)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const simState = useSimulationStore((s) => s.state)

  const [mainTab, setMainTab] = useState<MainTab>('code')

  useEffect(() => {
    if (data) setProject(data)
  }, [data, setProject])

  useEffect(() => {
    if (project?.files.length && !activeFileId) {
      const mainFile = project.files.find((f) => f.name.endsWith('.ino')) ?? project.files[0]
      if (mainFile) {
        setActiveFile(mainFile.id)
      }
    }
  }, [project, activeFileId, setActiveFile])

  const handleTabSwitch = useCallback((tab: MainTab) => {
    setMainTab(tab)
    if (tab === 'wiring') {
      setActiveFile(null)
    } else if (tab === 'code') {
      const proj = useProjectStore.getState().project
      if (proj?.files.length) {
        const mainFile = proj.files.find((f) => f.name.endsWith('.ino')) ?? proj.files[0]
        if (mainFile) setActiveFile(mainFile.id)
      }
    }
  }, [setActiveFile])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary text-text-secondary">
        Loading project...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary text-text-secondary">
        Failed to load project
      </div>
    )
  }

  const renderSidePanel = () => {
    switch (activePanel) {
      case 'files':
        return <ProjectExplorer />
      case 'components':
        return <ComponentLibrary />
      case 'ai':
        return <AIChat />
      default:
        return null
    }
  }

  return (
    <Layout>
      <div className="flex-1 flex min-h-0">
        {sidebarOpen && (
          <aside className="w-64 border-r border-border bg-bg-secondary flex flex-col min-h-0">
            {renderSidePanel()}
          </aside>
        )}

        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="flex border-b border-border bg-bg-secondary items-center">
            <button
              onClick={() => handleTabSwitch('code')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                mainTab === 'code'
                  ? 'border-accent text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Code
            </button>
            <button
              onClick={() => handleTabSwitch('wiring')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                mainTab === 'wiring'
                  ? 'border-accent text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Wiring
            </button>

            {mainTab === 'code' && project?.files.some((f) => f.isOpen) && (
              <>
                <div className="w-px h-4 bg-border mx-1" />
                {project.files
                  .filter((f) => f.isOpen)
                  .map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFile(f.id)}
                      className={`px-3 py-2 text-xs border-r border-border transition-colors ${
                        f.id === activeFileId
                          ? 'bg-bg-primary text-text-primary'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                      }`}
                    >
                      {f.name}
                      {f.isDirty && <span className="ml-1 text-warning">*</span>}
                    </button>
                  ))}
              </>
            )}

            <div className="flex-1" />

            {simState !== 'idle' && (
              <span className="text-xs text-text-secondary px-3">
                {simState === 'running' ? '🟢' : simState === 'paused' ? '🟡' : '🔴'}
                {' '}
                {simState}
              </span>
            )}
          </div>

          <div className="flex-1 min-h-0">
            {mainTab === 'code' ? <MonacoEditor /> : <WiringPlayground />}
          </div>

          {bottomPanelOpen && (
            <div className="border-t border-border bg-bg-secondary" style={{ height: 200 }}>
              <div className="flex items-center border-b border-border px-2">
                {(['serial', 'output', 'problems'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveBottomTab(tab)}
                    className={`px-3 py-1.5 text-xs capitalize transition-colors ${
                      activeBottomTab === tab
                        ? 'text-text-primary border-b-2 border-accent'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
                <div className="flex-1" />
                <button
                  onClick={toggleBottomPanel}
                  className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
                  title="Close panel"
                >
                  ✕
                </button>
              </div>
              <div className="h-[calc(100%-32px)] overflow-auto">
                {activeBottomTab === 'serial' && <SerialMonitor />}
                {activeBottomTab === 'output' && (
                  <div className="p-3 text-text-secondary text-xs font-mono">
                    Build output will appear here.
                  </div>
                )}
                {activeBottomTab === 'problems' && (
                  <div className="p-3 text-text-secondary text-xs font-mono">
                    No problems detected.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <SimulationControls />
    </Layout>
  )
}
