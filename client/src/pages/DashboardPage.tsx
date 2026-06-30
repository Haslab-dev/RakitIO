import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import { useProjects, useCreateProject, useDeleteProject } from '../lib/hooks/useApi'
import { useAuthStore } from '../lib/stores'
import { api } from '../lib/api'
import {
  IconPlus,
  IconUser,
  IconCpu,
  IconFolderOff,
  IconTrash,
} from '@tabler/icons-react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { data: projects, isLoading } = useProjects()
  const createMut = useCreateProject()
  const deleteMut = useDeleteProject()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth', { replace: true })
  }, [isAuthenticated, navigate])

  const handleCreate = () => {
    if (!name.trim()) return
    createMut.mutate(
      { name: name.trim(), description: description.trim() },
      {
        onSuccess: (res) => {
          setShowCreate(false)
          setName('')
          setDescription('')
          navigate(`/project/${res.id}`)
        },
      },
    )
  }

  const handleLogout = async () => {
    try { await api.auth.logout() } catch { /* ignore */ }
    logout()
    navigate('/')
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#060609] text-slate-100 font-sans flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] right-[10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-[#060609]/60 sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
            R
          </div>
          <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            RakitIO
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-355 bg-slate-800/45 border border-slate-800 px-3 py-1.5 rounded-lg font-mono flex items-center gap-1.5">
            <IconUser size={14} /> {user?.name}
          </span>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1"
          >
            <IconPlus size={14} /> New Project
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12 flex-1">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Projects Space
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            Arduino and electronics simulation projects
          </p>
        </div>

        {isLoading ? (
          <div className="text-slate-400 text-xs font-mono animate-pulse">Loading projects space...</div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div
                key={p.id}
                className="group border border-slate-800/80 rounded-xl bg-[#0B0B11] hover:bg-[#0B0B11]/80 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-blue-500/30 shadow-md hover:shadow-lg hover:shadow-blue-500/5 relative overflow-hidden"
                onClick={() => navigate(`/project/${p.id}`)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-[#060609] border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                        <IconCpu size={16} />
                      </div>
                      <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors text-sm truncate max-w-[140px]">
                        {p.name}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Delete this project?')) deleteMut.mutate(p.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all text-[10px] font-bold px-2 py-1 rounded border border-transparent hover:border-red-500/20 hover:bg-red-500/10 cursor-pointer flex items-center"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                  <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed min-h-[32px]">
                    {p.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-850 pt-3">
                    <span>ESP32 Board</span>
                    <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-800 rounded-xl p-16 text-center bg-[#0B0B11]/30 flex flex-col items-center">
            <IconFolderOff size={48} className="text-slate-500 mb-4" />
            <p className="text-slate-400 text-xs mb-6 font-medium">You don't have any projects in your workspace yet.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
            >
              <IconPlus size={14} /> Create Your First Project
            </button>
          </div>
        )}
      </main>

      {/* New Project Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#0B0B11] border border-slate-800/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            
            <h3 className="text-base font-bold text-slate-100 mb-5">New Simulation Project</h3>
            
            <div className="space-y-4">
              <label className="block">
                <span className="text-slate-400 text-xs font-medium mb-1.5 block">Project Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Arduino Project"
                  className="w-full bg-[#060609] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/80 transition-all"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </label>
              <label className="block">
                <span className="text-slate-400 text-xs font-medium mb-1.5 block">Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Blink an LED on pin 13..."
                  rows={3}
                  className="w-full bg-[#060609] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/80 transition-all resize-none"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800/60">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || createMut.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {createMut.isPending ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
