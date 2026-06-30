import { useProjectStore, useUIStore } from '../lib/stores'

export default function ProjectExplorer() {
  const project = useProjectStore((s) => s.project)
  const setActiveFile = useUIStore((s) => s.setActiveFile)
  const activeFileId = useUIStore((s) => s.activeFileId)

  if (!project) {
    return (
      <div className="p-3 text-text-secondary text-xs">No project loaded</div>
    )
  }

  const handleFileClick = (fileId: string) => {
    const files = project.files.map((f) =>
      f.id === fileId ? { ...f, isOpen: true } : f,
    )
    useProjectStore.setState({
      project: { ...project, files },
    })
    setActiveFile(fileId)
  }

  const folders = new Map<string, typeof project.files>()
  for (const file of project.files) {
    const folder = ''
    if (!folders.has(folder)) folders.set(folder, [])
    folders.get(folder)!.push(file)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          Explorer
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {[...folders.entries()].map(([folder, files]) => (
          <div key={folder || '__root'}>
            {folder && (
              <div className="px-3 py-1 text-xs text-text-secondary flex items-center gap-1">
                <span className="text-text-secondary">▸</span>
                {folder}
              </div>
            )}
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => handleFileClick(file.id)}
                className={`w-full text-left px-3 py-1 text-xs flex items-center gap-2 transition-colors ${
                  file.id === activeFileId
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-primary hover:bg-bg-hover'
                }`}
                style={{ paddingLeft: folder ? 28 : 12 }}
              >
                <FileIcon name={file.name} />
                <span className="truncate">{file.name}</span>
                {file.isDirty && <span className="text-warning ml-auto">●</span>}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  const color =
    ext === 'ino' || ext === 'cpp' || ext === 'c'
      ? 'text-accent'
      : ext === 'h'
        ? 'text-warning'
        : ext === 'json'
          ? 'text-success'
          : 'text-text-secondary'

  return (
    <span className={`${color} text-xs leading-none`}>
      {ext === 'ino' ? '⚡' : '📄'}
    </span>
  )
}
