import { useCallback, useMemo, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { useProjectStore, useUIStore, useSimulationStore } from '../lib/stores'

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'ino':
    case 'cpp':
    case 'cc':
    case 'h':
    case 'hpp':
      return 'cpp'
    case 'py':
      return 'python'
    case 'js':
      return 'javascript'
    case 'ts':
      return 'typescript'
    case 'json':
      return 'json'
    case 'html':
      return 'html'
    case 'css':
      return 'css'
    case 'xml':
      return 'xml'
    case 'yaml':
    case 'yml':
      return 'yaml'
    case 'md':
      return 'markdown'
    case 'sh':
      return 'shell'
    case 'c':
      return 'c'
    default:
      return 'plaintext'
  }
}

export default function MonacoEditor() {
  const project = useProjectStore((s) => s.project)
  const updateCode = useProjectStore((s) => s.updateCode)
  const activeFileId = useUIStore((s) => s.activeFileId)
  const theme = useUIStore((s) => s.theme)
  const currentLine = useSimulationStore((s) => s.currentLine)

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const decorationsRef = useRef<string[]>([])

  const activeFile = useMemo(() => {
    if (!project || !activeFileId) return null
    return project.files.find((f) => f.id === activeFileId) ?? null
  }, [project, activeFileId])

  const language = useMemo(() => {
    if (!activeFile) return 'cpp'
    return getLanguageFromFilename(activeFile.name)
  }, [activeFile])

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (activeFile && value !== undefined) {
        updateCode(activeFile.id, value)
      }
    },
    [activeFile, updateCode],
  )

  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco

    monaco.editor.defineTheme('rakit-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0B0B11',
        'editor.lineHighlightBackground': '#181826',
        'editorGutter.background': '#0B0B11',
      }
    })

    monaco.editor.defineTheme('rakit-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.lineHighlightBackground': '#F1F5F9',
        'editorGutter.background': '#FFFFFF',
      }
    })

    monaco.editor.setTheme(theme === 'dark' ? 'rakit-dark' : 'rakit-light')
  }, [theme])

  // Dynamically switch theme
  useEffect(() => {
    const monaco = monacoRef.current
    if (monaco) {
      monaco.editor.setTheme(theme === 'dark' ? 'rakit-dark' : 'rakit-light')
    }
  }, [theme])

  // Highlight current line when VM steps or hits a breakpoint
  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return

    if (currentLine !== null && currentLine > 0) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
        {
          range: new monaco.Range(currentLine, 1, currentLine, 1),
          options: {
            isWholeLine: true,
            className: 'bg-yellow-500/10 border-l-4 border-yellow-500',
          },
        },
      ])
      editor.revealLineInCenterIfOutsideViewport(currentLine)
    } else {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [])
    }
  }, [currentLine])

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary text-sm">
        Select a file to edit
      </div>
    )
  }

  return (
    <Editor
      height="100%"
      language={language}
      value={activeFile.content}
      onChange={handleChange}
      onMount={handleEditorDidMount}
      theme={theme === 'dark' ? 'rakit-dark' : 'rakit-light'}
      path={`${activeFile.path}/${activeFile.name}`}
      options={{
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 8 },
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        bracketPairColorization: { enabled: true },
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
      }}
    />
  )
}
