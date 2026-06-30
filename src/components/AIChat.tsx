import { useState, useRef, useEffect } from 'react'
import { useAIChat } from '../lib/hooks/useApi'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_ACTIONS = [
  { label: 'Explain code', prompt: 'Explain the current Arduino code' },
  { label: 'Fix wiring', prompt: 'Check my wiring and suggest fixes' },
  { label: 'Add LED blink', prompt: 'Add an LED blink example to my code' },
  { label: 'Generate component', prompt: 'Generate code for a servo motor control' },
]

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const chatMut = useAIChat()
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || chatMut.isPending) return

    const userMsg: Message = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')

    chatMut.mutate(newMessages, {
      onSuccess: (res) => {
        setMessages([...newMessages, { role: 'assistant', content: res.reply }])
      },
      onError: () => {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
        ])
      },
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          AI Assistant
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-text-secondary text-xs mb-3">
              Ask the AI assistant for help with your project.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => send(action.prompt)}
                  className="px-2 py-1 text-xs bg-bg-tertiary hover:bg-bg-hover border border-border rounded text-text-secondary hover:text-text-primary transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-xs ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block max-w-[90%] rounded-lg px-3 py-2 ${
                msg.role === 'user'
                  ? 'bg-accent text-white'
                  : 'bg-bg-tertiary text-text-primary border border-border'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
            </div>
          </div>
        ))}

        {chatMut.isPending && (
          <div className="text-xs text-text-secondary">
            <div className="inline-block bg-bg-tertiary border border-border rounded-lg px-3 py-2">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border p-2">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Ask something..."
            rows={2}
            className="flex-1 bg-bg-tertiary border border-border rounded-md px-3 py-2 text-text-primary text-xs outline-none focus:border-accent resize-none"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || chatMut.isPending}
            className="px-3 bg-accent hover:bg-accent-hover text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50 self-end"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
