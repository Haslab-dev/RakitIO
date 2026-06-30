import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

const PROVIDER_PRESETS: Record<string, { baseUrl: string; models: string[] }> = {
  openai: { baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  anthropic: { baseUrl: 'https://api.anthropic.com/v1', models: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'] },
  gemini: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta', models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'] },
  openrouter: { baseUrl: 'https://openrouter.ai/api/v1', models: ['openai/gpt-4o', 'anthropic/claude-sonnet-4-20250514', 'google/gemini-2.0-flash'] },
  custom: { baseUrl: '', models: [] },
}

export default function AISettings() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', provider: 'openai', baseUrl: '', apiKey: '', model: '' })

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: () => api.providers.list(),
  })

  const createMut = useMutation({
    mutationFn: (data: typeof form) => api.providers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      setShowForm(false)
      setForm({ name: '', provider: 'openai', baseUrl: '', apiKey: '', model: '' })
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.providers.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['providers'] }),
  })

  const activateMut = useMutation({
    mutationFn: (id: string) => api.providers.activate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['providers'] }),
  })

  const handleProviderChange = (provider: string) => {
    const preset = PROVIDER_PRESETS[provider]
    setForm({ ...form, provider, baseUrl: preset?.baseUrl ?? '', model: preset?.models[0] ?? '' })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          AI Providers
        </span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-accent hover:text-accent-hover transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {showForm && (
          <div className="border border-border rounded-lg p-3 space-y-2 bg-bg-secondary">
            <input
              placeholder="Name (e.g. My OpenAI)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
            />

            <select
              value={form.provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="gemini">Google Gemini</option>
              <option value="openrouter">OpenRouter</option>
              <option value="custom">Custom (OpenAI-compatible)</option>
            </select>

            <input
              placeholder="Base URL"
              value={form.baseUrl}
              onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
              className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
            />

            <input
              type="password"
              placeholder="API Key"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
            />

            {PROVIDER_PRESETS[form.provider]?.models.length ? (
              <select
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
              >
                {PROVIDER_PRESETS[form.provider].models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            ) : (
              <input
                placeholder="Model name"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
              />
            )}

            <button
              onClick={() => createMut.mutate(form)}
              disabled={!form.name || !form.baseUrl || !form.apiKey || !form.model || createMut.isPending}
              className="w-full bg-accent hover:bg-accent-hover text-white rounded py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {createMut.isPending ? 'Adding...' : 'Add Provider'}
            </button>
          </div>
        )}

        {providers.length === 0 && !showForm && (
          <p className="text-text-secondary text-xs text-center py-4">
            No AI providers configured. Add one to use AI features.
          </p>
        )}

        {providers.map((p) => (
          <div
            key={p.id}
            className={`border rounded-lg p-3 space-y-1 ${
              p.isActive ? 'border-accent bg-accent/5' : 'border-border bg-bg-secondary'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-primary">{p.name}</span>
                {p.isActive && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-accent text-white rounded">Active</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!p.isActive && (
                  <button
                    onClick={() => activateMut.mutate(p.id)}
                    className="text-[10px] text-accent hover:text-accent-hover transition-colors"
                  >
                    Activate
                  </button>
                )}
                <button
                  onClick={() => deleteMut.mutate(p.id)}
                  className="text-[10px] text-error hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="text-[10px] text-text-secondary space-y-0.5">
              <div>Provider: {p.provider}</div>
              <div>Model: {p.model}</div>
              <div>URL: {p.baseUrl}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
