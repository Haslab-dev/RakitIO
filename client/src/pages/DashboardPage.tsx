import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import { useProjects, useCreateProject, useDeleteProject } from '../lib/hooks/useApi'
import { useAuthStore } from '../lib/stores'
import { api } from '../lib/api'

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
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-white font-bold text-sm">R</div>
          <h1 className="text-xl font-semibold text-text-primary group-hover:text-accent transition-colors">RakitIO</h1>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary">{user?.name}</span>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium transition-colors"
          >
            New Project
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-text-secondary hover:text-text-primary text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-text-primary mb-1">Your Projects</h2>
        <p className="text-text-secondary text-sm mb-8">
          Arduino and electronics simulation projects
        </p>

        {isLoading ? (
          <div className="text-text-secondary text-sm">Loading projects...</div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="group border border-border rounded-lg bg-bg-secondary hover:bg-bg-hover transition-colors cursor-pointer"
                onClick={() => navigate(`/project/${p.id}`)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-text-primary group-hover:text-accent transition-colors">
                      {p.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Delete this project?')) deleteMut.mutate(p.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-error transition-all text-xs px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-text-secondary text-sm line-clamp-2 mb-3">
                    {p.description || 'No description'}
                  </p>
                  <span className="text-text-secondary text-xs">
                    Updated {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-text-secondary mb-4">No projects yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium transition-colors"
            >
              Create your first project
            </button>
          </div>
        )}
      </main>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-bg-secondary border border-border rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">New Project</h3>
            <label className="block mb-4">
              <span className="text-text-secondary text-sm mb-1 block">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Arduino Project"
                className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-text-primary text-sm outline-none focus:border-accent"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </label>
            <label className="block mb-6">
              <span className="text-text-secondary text-sm mb-1 block">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Blink an LED on pin 13..."
                rows={3}
                className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-text-primary text-sm outline-none focus:border-accent resize-none"
              />
            </label>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || createMut.isPending}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {createMut.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
