import { useState } from 'react'
import { useProjectStore } from '../lib/stores'
import { IconX, IconCpu, IconBrain } from '@tabler/icons-react'
import AISettings from './AISettings'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type TabId = 'project' | 'ai'

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const project = useProjectStore((s) => s.project)
  const updateSettings = useProjectStore((s) => s.updateSettings)
  const save = useProjectStore((s) => s.save)

  const [activeTab, setActiveTab] = useState<TabId>('project')
  const [boardId, setBoardId] = useState(project?.settings?.boardId || 'arduino-uno')
  const [clockSpeed, setClockSpeed] = useState(project?.settings?.clockSpeed || 16)
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen || !project) return null

  const handleSaveProjectSettings = async () => {
    setIsSaving(true)
    try {
      updateSettings({
        boardId,
        clockSpeed,
      })
      await save()
      onClose()
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[500px]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-bg-tertiary">
          <span className="text-sm font-semibold text-text-primary">Settings</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-all cursor-pointer"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-border bg-bg-tertiary/50 px-2">
          <button
            onClick={() => setActiveTab('project')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'project'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <IconCpu size={14} />
            Project Config
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ai'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <IconBrain size={14} />
            AI Providers
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'project' ? (
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Microcontroller Board</label>
                <select
                  value={boardId}
                  onChange={(e) => {
                    const newBoard = e.target.value
                    setBoardId(newBoard)
                    if (newBoard === 'esp32-devkit-v1') setClockSpeed(240)
                    else if (newBoard === 'raspberry-pi-pico') setClockSpeed(133)
                    else setClockSpeed(16)
                  }}
                  className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent cursor-pointer"
                >
                  <option value="arduino-uno">Arduino Uno R3 (ATmega328P)</option>
                  <option value="esp32-devkit-v1">ESP32 DevKit V1 (WROOM-32)</option>
                  <option value="raspberry-pi-pico">Raspberry Pi Pico (RP2040)</option>
                </select>
                <p className="text-[10px] text-text-secondary opacity-60">
                  Note: Changing the board will update the available GPIO pinout on the canvas.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">CPU Frequency (MHz)</label>
                <input
                  type="number"
                  value={clockSpeed}
                  onChange={(e) => setClockSpeed(Number(e.target.value))}
                  className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 bg-bg-primary hover:bg-bg-hover border border-border text-xs text-text-secondary hover:text-text-primary rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProjectSettings}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded-lg shadow-md shadow-accent/15 transition-all cursor-pointer disabled:opacity-55"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <AISettings />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}