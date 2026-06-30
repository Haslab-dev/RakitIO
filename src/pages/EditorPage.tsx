import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router'
import { useProject } from '../lib/hooks/useApi'
import { useProjectStore, useUIStore, useSimulationStore } from '../lib/stores'
import { destroySimulationBridge } from '../lib/simulationWorker'
import Layout from '../components/Layout'
import MonacoEditor from '../components/MonacoEditor'
import ProjectExplorer from '../components/ProjectExplorer'
import ComponentLibrary from '../components/ComponentLibrary'
import AIChat from '../components/AIChat'
import WiringPlayground from '../components/WiringPlayground'
import SerialMonitor from '../components/SerialMonitor'
import SimulationControls from '../components/SimulationControls'
import DeviceInspector from '../components/DeviceInspector'
import VariableInspector from '../components/VariableInspector'
import LogicAnalyzer from '../components/LogicAnalyzer'
import {
  IconX,
  IconFolder,
  IconCpu,
  IconAdjustments,
  IconBug,
  IconMessageChatbot,
  IconBook,
} from '@tabler/icons-react'

type LeftTab = 'files' | 'components'
type RightTab = 'properties' | 'variables' | 'ai' | 'docs'

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useProject(id!)
  const setProject = useProjectStore((s) => s.setProject)
  const project = useProjectStore((s) => s.project)
  const activeFileId = useUIStore((s) => s.activeFileId)
  const setActiveFile = useUIStore((s) => s.setActiveFile)
  const bottomPanelOpen = useUIStore((s) => s.bottomPanelOpen)
  const toggleBottomPanel = useUIStore((s) => s.toggleBottomPanel)
  const activeBottomTab = useUIStore((s) => s.activeBottomTab)
  const setActiveBottomTab = useUIStore((s) => s.setActiveBottomTab)
  const selection = useUIStore((s) => s.selection)

  // Sidebar Tab States
  const [leftTab, setLeftTab] = useState<LeftTab>('files')
  const [rightTab, setRightTab] = useState<RightTab>('properties')
  const leftSidebarOpen = true
  const rightSidebarOpen = true

  // Resizable Bottom Panel States
  const [bottomPanelHeight, setBottomPanelHeight] = useState(260)
  const [isResizing, setIsResizing] = useState(false)
  const splitterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (data) setProject(data)
  }, [data, setProject])

  // Stop the simulation and tear down the worker when leaving this project
  // (navigating back to dashboard) or switching to a different project id.
  // This prevents a stale/cached worker from running the previous project's
  // code against the newly loaded project.
  useEffect(() => {
    return () => {
      useSimulationStore.getState().reset()
      destroySimulationBridge()
    }
  }, [id])

  useEffect(() => {
    if (project?.files.length && !activeFileId) {
      const mainFile = project.files.find((f) => f.name.endsWith('.ino')) ?? project.files[0]
      if (mainFile) {
        setActiveFile(mainFile.id)
      }
    }
  }, [project, activeFileId, setActiveFile])

  // Splitter Resize Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return
    const newHeight = window.innerHeight - e.clientY
    const maxHeight = window.innerHeight * 0.7
    setBottomPanelHeight(Math.max(180, Math.min(newHeight, maxHeight)))
  }, [isResizing])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary text-text-secondary font-mono text-xs animate-pulse">
        Loading workspace...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary text-error font-semibold">
        Failed to load project
      </div>
    )
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col min-h-0 relative">
        
        {/* Main Split Area (Top: Workspace, Bottom: Resizable Panel) */}
        <div className="flex-1 flex min-h-0 relative">
          
          {/* Left Sidebar */}
          {leftSidebarOpen && (
            <aside className="w-64 border-r border-border bg-bg-secondary flex flex-col min-h-0">
              <div className="flex border-b border-border bg-bg-tertiary h-10 shrink-0">
                <button
                  onClick={() => setLeftTab('files')}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    leftTab === 'files'
                      ? 'border-accent text-text-primary bg-bg-secondary/40'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <IconFolder size={14} /> Explorer
                </button>
                <button
                  onClick={() => setLeftTab('components')}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    leftTab === 'components'
                      ? 'border-accent text-text-primary bg-bg-secondary/40'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <IconCpu size={14} /> Palette
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {leftTab === 'files' ? <ProjectExplorer /> : <ComponentLibrary />}
              </div>
            </aside>
          )}

          {/* Center Wiring Canvas */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0 relative bg-bg-primary">
            <WiringPlayground />
          </div>

          {/* Right Sidebar (Inspector) */}
          {rightSidebarOpen && (
            <aside className="w-72 border-l border-border bg-bg-secondary flex flex-col min-h-0">
              <div className="flex border-b border-border bg-bg-tertiary h-10 shrink-0">
                {(
                  [
                    { id: 'properties', label: 'Properties', icon: <IconAdjustments size={14} /> },
                    { id: 'variables', label: 'Debugger', icon: <IconBug size={14} /> },
                    { id: 'ai', label: 'AI Copilot', icon: <IconMessageChatbot size={14} /> },
                    { id: 'docs', label: 'Docs', icon: <IconBook size={14} /> },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setRightTab(tab.id)}
                    className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold border-b-2 transition-all cursor-pointer py-1 ${
                      rightTab === tab.id
                        ? 'border-accent text-text-primary bg-bg-secondary/40'
                        : 'border-transparent text-text-secondary hover:text-text-primary'
                    }`}
                    title={tab.label}
                  >
                    {tab.icon}
                    <span>{tab.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {rightTab === 'properties' && (
                  selection && selection.type === 'component' ? (
                    <DeviceInspector />
                  ) : (
                    <div className="p-4 text-xs text-text-secondary font-mono text-center">
                      Select a component on the canvas to inspect its properties.
                    </div>
                  )
                )}
                {rightTab === 'variables' && <VariableInspector />}
                {rightTab === 'ai' && <AIChat />}
                {rightTab === 'docs' && (
                  <div className="p-4 text-xs text-text-secondary font-mono leading-relaxed">
                    <h3 className="font-semibold text-text-primary mb-2">Workspace Docs</h3>
                    <p className="mb-2">Drag components from the Palette to the canvas, then click on pin nodes to draw wires.</p>
                    <h4 className="font-semibold text-text-primary mt-4 mb-1">C++ VM builtins:</h4>
                    <ul className="list-disc list-inside space-y-1 text-[11px]">
                      <li>pinMode(pin, mode)</li>
                      <li>digitalWrite(pin, val)</li>
                      <li>digitalRead(pin)</li>
                      <li>analogWrite(pin, val)</li>
                      <li>analogRead(pin)</li>
                      <li>delay(ms)</li>
                    </ul>
                  </div>
                )}
              </div>
            </aside>
          )}

        </div>

        {/* Resizable Bottom Panel (Monaco + Console) */}
        {bottomPanelOpen && (
          <div
            className="border-t border-border bg-bg-secondary flex flex-col shrink-0 min-h-0"
            style={{ height: bottomPanelHeight }}
          >
            {/* Horizontal Drag Splitter */}
            <div
              ref={splitterRef}
              onMouseDown={handleMouseDown}
              className="h-1 bg-border hover:bg-accent cursor-row-resize transition-colors select-none shrink-0"
            />

            <div className="flex-1 flex min-h-0">
              
              {/* Left Side: Monaco Code Editor */}
              <div className="w-3/5 border-r border-border flex flex-col min-h-0">
                <div className="flex items-center border-b border-border px-3 h-8 shrink-0 bg-bg-tertiary">
                  <span className="text-xs font-mono font-semibold text-text-secondary">sketch.ino</span>
                </div>
                <div className="flex-1 min-h-0 relative">
                  <MonacoEditor />
                </div>
              </div>

              {/* Right Side: Tabbed Consoles */}
              <div className="w-2/5 flex flex-col min-h-0">
                <div className="flex items-center border-b border-border px-2 h-8 shrink-0 bg-bg-tertiary">
                  {(
                    [
                      { id: 'serial', label: 'Serial Monitor' },
                      { id: 'variables', label: 'Variables' },
                      { id: 'logic', label: 'Logic Analyzer' },
                      { id: 'output', label: 'Build Output' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveBottomTab(tab.id as any)}
                      className={`px-3 h-full text-xs font-semibold transition-all cursor-pointer ${
                        activeBottomTab === tab.id
                          ? 'text-text-primary border-b-2 border-accent'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button
                    onClick={toggleBottomPanel}
                    className="p-1 text-text-secondary hover:text-text-primary cursor-pointer flex items-center justify-center"
                    title="Close panel"
                  >
                    <IconX size={14} />
                  </button>
                </div>
                <div className="flex-1 overflow-auto bg-[#050508]">
                  {activeBottomTab === 'serial' && <SerialMonitor />}
                  {activeBottomTab === 'variables' && <VariableInspector />}
                  {activeBottomTab === 'logic' && <LogicAnalyzer />}
                  {activeBottomTab === 'output' && (
                    <div className="p-3 text-text-secondary text-xs font-mono">
                      Build output will appear here.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Global Floating Simulation Controls Footer */}
        <SimulationControls />
      </div>
    </Layout>
  )
}
