import type { Project } from './types'

export async function exportAsIno(project: Project): Promise<Blob> {
  const mainFile = project.files.find((f) => f.name.endsWith('.ino')) ?? project.files[0]
  const content = mainFile?.content ?? ''
  return new Blob([content], { type: 'text/x-arduino' })
}

export async function exportAsJson(project: Project): Promise<Blob> {
  const data = {
    name: project.name,
    description: project.description,
    settings: project.settings,
    files: project.files.map((f) => ({
      name: f.name,
      path: f.path,
      content: f.content,
      language: f.language,
    })),
    components: project.components,
    wires: project.wires,
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  }
  const json = JSON.stringify(data, null, 2)
  return new Blob([json], { type: 'application/json' })
}

export async function exportAsArduinoZip(project: Project): Promise<Blob> {
  const mainFile = project.files.find((f) => f.name.endsWith('.ino')) ?? project.files[0]
  const sketchName = project.name.replace(/[^a-zA-Z0-9_-]/g, '_')
  const inoContent = mainFile?.content ?? ''

  const lines: string[] = []
  lines.push(`Sketch: ${sketchName}`)
  lines.push(`Board: ${project.settings.boardId}`)
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push('')
  lines.push('=== File: ' + (mainFile?.name ?? 'sketch.ino') + ' ===')
  lines.push(inoContent)
  lines.push('')

  for (const file of project.files) {
    if (file.id === mainFile?.id) continue
    lines.push(`=== File: ${file.name} ===`)
    lines.push(file.content)
    lines.push('')
  }

  const textContent = lines.join('\n')
  return new Blob([textContent], { type: 'application/zip' })
}

function buildWiringSvg(project: Project): string {
  const width = 1200
  const height = 800

  const svgParts: string[] = []
  svgParts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
  )
  svgParts.push(`<rect width="${width}" height="${height}" fill="#1a1a2e"/>`)
  svgParts.push(`<text x="${width / 2}" y="30" text-anchor="middle" fill="#ccc" font-size="16" font-family="sans-serif">${escapeXml(project.name)} — Wiring Diagram</text>`)

  for (const comp of project.components) {
    svgParts.push(
      `<g transform="translate(${comp.x}, ${comp.y}) rotate(${comp.rotation})">`
    )
    svgParts.push(
      `<rect x="0" y="0" width="60" height="40" rx="4" fill="#222" stroke="#444" stroke-width="1"/>`
    )
    svgParts.push(
      `<text x="30" y="24" text-anchor="middle" fill="#aaa" font-size="10" font-family="monospace">${escapeXml(comp.label)}</text>`
    )
    svgParts.push('</g>')
  }

  for (const wire of project.wires) {
    const fromComp = project.components.find((c) => c.id === wire.from.componentId)
    const toComp = project.components.find((c) => c.id === wire.to.componentId)
    if (!fromComp || !toComp) continue

    const fx = fromComp.x + 30
    const fy = fromComp.y + 20
    const tx = toComp.x + 30
    const ty = toComp.y + 20
    const mx = (fx + tx) / 2

    svgParts.push(
      `<path d="M ${fx} ${fy} C ${mx} ${fy}, ${mx} ${ty}, ${tx} ${ty}" fill="none" stroke="${wire.color}" stroke-width="2" stroke-linecap="round"/>`
    )
  }

  svgParts.push('</svg>')
  return svgParts.join('\n')
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function exportWiringSvg(project: Project): Promise<Blob> {
  const svg = buildWiringSvg(project)
  return new Blob([svg], { type: 'image/svg+xml' })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
