import { useCallback, useMemo } from 'react'
import Editor from '@monaco-editor/react'
import { useProjectStore, useUIStore } from '../lib/stores'

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
      theme="vs-dark"
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
