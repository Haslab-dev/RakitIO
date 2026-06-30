import type { SimulationSnapshot, SimulationEvent } from '../lib/types'

interface SimConfig {
  speed: number
  loopIntervalMs: number
}

interface PinState {
  mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP' | 'PWM' | 'ANALOG'
  value: number
}

interface SimContext {
  pins: Map<string, PinState>
  serialBuffer: string[]
  cycleCount: number
  running: boolean
  paused: boolean
  config: SimConfig
  setup: (() => void) | null
  loop: (() => void) | null
  timer: ReturnType<typeof setInterval> | null
  delayMs: number
  pinOverrides: Map<string, number>
}

const ctx: SimContext = {
  pins: new Map(),
  serialBuffer: [],
  cycleCount: 0,
  running: false,
  paused: false,
  config: { speed: 1, loopIntervalMs: 100 },
  setup: null,
  loop: null,
  timer: null,
  delayMs: 1000,
  pinOverrides: new Map(),
}

function postMessage(msg: unknown) {
  self.postMessage(msg)
}

function parseArduinoCode(code: string): { setupCode: string; loopCode: string } {
  const setupMatch = code.match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\}/)
  const loopMatch = code.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\}/)

  return {
    setupCode: setupMatch?.[1]?.trim() ?? '',
    loopCode: loopMatch?.[1]?.trim() ?? '',
  }
}

function extractPinNumber(expr: string): string {
  const match = expr.match(/(\d+)/)
  return match?.[1] ?? '0'
}

function executeLine(line: string): void {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return

  const pinModeMatch = trimmed.match(/pinMode\s*\(\s*(\w+)\s*,\s*(OUTPUT|INPUT|INPUT_PULLUP)\s*\)/)
  if (pinModeMatch) {
    const pin = extractPinNumber(pinModeMatch[1])
    const mode = pinModeMatch[2] as PinState['mode']
    ctx.pins.set(pin, { mode, value: 0 })
    return
  }

  const digitalWriteMatch = trimmed.match(/digitalWrite\s*\(\s*(\w+)\s*,\s*(HIGH|LOW)\s*\)/)
  if (digitalWriteMatch) {
    const pin = extractPinNumber(digitalWriteMatch[1])
    const value = digitalWriteMatch[2] === 'HIGH' ? 1 : 0
    const existing = ctx.pins.get(pin)
    if (existing) {
      existing.value = value
    } else {
      ctx.pins.set(pin, { mode: 'OUTPUT', value })
    }

    const event: SimulationEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      type: 'pin_change',
      pinId: pin,
      value,
    }
    postMessage({ type: 'event', payload: event })
    return
  }

  const analogWriteMatch = trimmed.match(/analogWrite\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)/)
  if (analogWriteMatch) {
    const pin = extractPinNumber(analogWriteMatch[1])
    const value = Math.min(255, Math.max(0, parseInt(analogWriteMatch[2], 10)))
    const existing = ctx.pins.get(pin)
    if (existing) {
      existing.value = value
    } else {
      ctx.pins.set(pin, { mode: 'PWM', value })
    }

    const event: SimulationEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      type: 'pin_change',
      pinId: pin,
      value,
    }
    postMessage({ type: 'event', payload: event })
    return
  }

  const analogReadMatch = trimmed.match(/(?:int|long|float)?\s*\w+\s*=\s*analogRead\s*\(\s*(\w+)\s*\)/)
  if (analogReadMatch) {
    const pin = extractPinNumber(analogReadMatch[1])
    const override = ctx.pinOverrides.get(pin)
    if (override !== undefined) {
      const event: SimulationEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        type: 'pin_change',
        pinId: pin,
        value: override,
      }
      postMessage({ type: 'event', payload: event })
    }
    return
  }

  const digitalReadMatch = trimmed.match(/(?:int|long)?\s*\w+\s*=\s*digitalRead\s*\(\s*(\w+)\s*\)/)
  if (digitalReadMatch) {
    const pin = extractPinNumber(digitalReadMatch[1])
    const pinState = ctx.pins.get(pin)
    const override = ctx.pinOverrides.get(pin)
    if (override !== undefined) {
      const event: SimulationEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        type: 'pin_change',
        pinId: pin,
        value: override,
      }
      postMessage({ type: 'event', payload: event })
    } else if (pinState) {
      const event: SimulationEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        type: 'pin_change',
        pinId: pin,
        value: pinState.value,
      }
      postMessage({ type: 'event', payload: event })
    }
    return
  }

  const serialPrintMatch = trimmed.match(/Serial\.(print|println)\s*\(\s*(.+?)\s*\)/)
  if (serialPrintMatch) {
    let text = serialPrintMatch[2]
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.slice(1, -1)
    }
    if (text.endsWith(', DEC)')) text = text.replace(', DEC)', '')
    if (text.endsWith(', HEX)')) {
      text = text.replace(', HEX)', '')
      const num = parseInt(text, 10)
      if (!isNaN(num)) text = '0x' + num.toString(16)
    }
    if (text.endsWith(', BIN)')) {
      text = text.replace(', BIN)', '')
      const num = parseInt(text, 10)
      if (!isNaN(num)) text = num.toString(2)
    }

    const lineEnding = serialPrintMatch[1] === 'println' ? '\n' : ''
    ctx.serialBuffer.push(text + lineEnding)

    postMessage({ type: 'serial', payload: text + lineEnding })
    return
  }

  const delayMatch = trimmed.match(/delay\s*\(\s*(\d+)\s*\)/)
  if (delayMatch) {
    ctx.delayMs = parseInt(delayMatch[1], 10)
    return
  }

  const delayMicrosecondsMatch = trimmed.match(/delayMicroseconds\s*\(\s*(\d+)\s*\)/)
  if (delayMicrosecondsMatch) {
    ctx.delayMs = parseInt(delayMicrosecondsMatch[1], 10) / 1000
    return
  }
}

function executeBlock(code: string): void {
  const lines = code.split(';')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const forMatch = trimmed.match(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\w+\s*(<|<=|>|>=)\s*(\d+)\s*;\s*\w+(\+\+|--|\+=\s*\d+|-=\s*\d+)\s*\)/)
    if (forMatch) {
      const start = parseInt(forMatch[2], 10)
      const op = forMatch[3]
      const end = parseInt(forMatch[4], 10)
      const limit = op === '<=' ? end + 1 : end
      for (let i = start; i < Math.min(limit, start + 1000); i++) {
        ctx.cycleCount++
      }
      continue
    }

    executeLine(trimmed)
  }
}

function buildSnapshot(): SimulationSnapshot {
  const pinStates: Record<string, Record<string, number>> = {}
  for (const [pin, state] of ctx.pins) {
    pinStates[pin] = { [state.mode]: state.value }
  }

  return {
    timestamp: Date.now(),
    pinStates,
    componentStates: {},
    serialBuffer: ctx.serialBuffer.join(''),
    cycleCount: ctx.cycleCount,
  }
}

function runLoopIteration() {
  if (!ctx.running || ctx.paused || !ctx.loop) return

  ctx.cycleCount++
  ctx.loop?.()

  postMessage({ type: 'snapshot', payload: buildSnapshot() })
}

function startSimulation(code: string, speed: number) {
  stopSimulation()

  const { setupCode, loopCode } = parseArduinoCode(code)

  ctx.pins.clear()
  ctx.serialBuffer = []
  ctx.cycleCount = 0
  ctx.running = true
  ctx.paused = false

  ctx.setup = () => executeBlock(setupCode)
  ctx.loop = () => executeBlock(loopCode)

  postMessage({ type: 'state', payload: 'running' })

  ctx.setup()

  const interval = Math.max(10, ctx.config.loopIntervalMs / speed)
  ctx.timer = setInterval(runLoopIteration, interval)
}

function stopSimulation() {
  ctx.running = false
  ctx.paused = false
  if (ctx.timer) {
    clearInterval(ctx.timer)
    ctx.timer = null
  }
}

function pauseSimulation() {
  ctx.paused = true
  if (ctx.timer) {
    clearInterval(ctx.timer)
    ctx.timer = null
  }
}

function resumeSimulation(speed: number) {
  ctx.paused = false
  const interval = Math.max(10, ctx.config.loopIntervalMs / speed)
  ctx.timer = setInterval(runLoopIteration, interval)
}

function stepSimulation() {
  if (ctx.loop) {
    ctx.cycleCount++
    ctx.loop()
    postMessage({ type: 'snapshot', payload: buildSnapshot() })
  }
}

function resetSimulation() {
  stopSimulation()
  ctx.pins.clear()
  ctx.serialBuffer = []
  ctx.cycleCount = 0
  ctx.pinOverrides.clear()
  ctx.setup = null
  ctx.loop = null
  postMessage({ type: 'state', payload: 'idle' })
}

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data

  switch (type) {
    case 'start':
      ctx.config.speed = payload.config?.speed ?? 1
      startSimulation(payload.code, ctx.config.speed)
      break

    case 'stop':
      stopSimulation()
      postMessage({ type: 'state', payload: 'idle' })
      break

    case 'pause':
      pauseSimulation()
      postMessage({ type: 'state', payload: 'paused' })
      break

    case 'resume':
      resumeSimulation(ctx.config.speed)
      postMessage({ type: 'state', payload: 'running' })
      break

    case 'step':
      stepSimulation()
      break

    case 'reset':
      resetSimulation()
      break

    case 'setPin':
      ctx.pinOverrides.set(payload.pin, payload.value)
      break

    case 'setSpeed': {
      ctx.config.speed = payload
      if (ctx.running && !ctx.paused) {
        if (ctx.timer) clearInterval(ctx.timer)
        const interval = Math.max(10, ctx.config.loopIntervalMs / payload)
        ctx.timer = setInterval(runLoopIteration, interval)
      }
      break
    }

    default:
      postMessage({
        type: 'error',
        payload: { message: `Unknown message type: ${type}` },
      })
  }
}
