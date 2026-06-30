import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { api } from '../lib/api'
import { useAuthStore } from '../lib/stores'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let res: { token: string; user: { id: string; email: string; name: string } }
      if (mode === 'register') {
        res = await api.auth.register(email, password, name)
      } else {
        res = await api.auth.login(email, password)
      }
      setAuth(res.token, res.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <nav className="border-b border-border px-6 py-4">
        <Link to="/" className="flex items-center gap-3 w-fit group">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-white font-bold text-sm">R</div>
          <span className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">RakitIO</span>
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-text-secondary">
              {mode === 'login'
                ? 'Sign in to continue to RakitIO'
                : 'Start building embedded systems in your browser'}
            </p>
          </div>

          <div className="flex border border-border rounded-lg overflow-hidden mb-6">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError('') }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === 'register' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs text-text-secondary mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs text-text-secondary mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              />
            </div>

            {error && (
              <div className="text-error text-xs bg-error/10 border border-error/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-xs text-text-secondary mt-4">
              Demo: <span className="text-text-primary">demo@rakit.io</span> / <span className="text-text-primary">demo1234</span>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
