import type { SimulationSnapshot, SimulationEvent, SimulationState } from './types'
import { useSimulationStore } from './stores'

export interface WorkerMessage {
  type: 'snapshot' | 'serial' | 'event' | 'state' | 'error'
  payload: unknown
}

export class SimulationWorkerBridge {
  private worker: Worker | null = null
  private unsubscribeStore: (() => void) | null = null

  constructor() {}

  private getStore() {
    return useSimulationStore.getState()
  }

  private handleWorkerMessage = (e: MessageEvent<WorkerMessage>) => {
    const msg = e.data
    const store = this.getStore()

    switch (msg.type) {
      case 'snapshot':
        store.setSnapshot(msg.payload as SimulationSnapshot)
        break
      case 'serial':
        store.addSerialOutput(msg.payload as string)
        break
      case 'event':
        store.addEvent(msg.payload as SimulationEvent)
        break
      case 'state':
        store.setState(msg.payload as SimulationState)
        break
      case 'error':
        store.addSerialOutput(`ERROR: ${(msg.payload as { message: string }).message}`)
        store.setState('error')
        break
    }
  }

  private ensureWorker() {
    if (!this.worker) {
      this.worker = new Worker(
        new URL('../workers/simulation.worker.ts', import.meta.url),
        { type: 'module' }
      )
      this.worker.onmessage = this.handleWorkerMessage
      this.worker.onerror = (e) => {
        console.error('[SimulationWorker] Error:', e)
        this.getStore().setState('error')
        this.getStore().addSerialOutput(`Worker error: ${e.message}`)
      }
    }
  }

  start(code: string, config?: Record<string, unknown>) {
    this.ensureWorker()
    this.worker!.postMessage({ type: 'start', payload: { code, config } })

    const unsub = useSimulationStore.subscribe((state, prev) => {
      if (state.state !== prev.state) {
        if (state.state === 'paused') {
          this.pause()
        } else if (state.state === 'running' && prev.state === 'paused') {
          this.resume()
        } else if (state.state === 'idle') {
          this.stop()
        }
      }
      if (state.config.speed !== prev.config.speed) {
        this.worker?.postMessage({ type: 'setSpeed', payload: state.config.speed })
      }
    })
    this.unsubscribeStore = unsub
  }

  stop() {
    this.worker?.postMessage({ type: 'stop' })
  }

  pause() {
    this.worker?.postMessage({ type: 'pause' })
  }

  resume() {
    this.worker?.postMessage({ type: 'resume' })
  }

  step() {
    this.ensureWorker()
    this.worker!.postMessage({ type: 'step' })
  }

  reset() {
    this.worker?.postMessage({ type: 'reset' })
    this.unsubscribeStore?.()
    this.unsubscribeStore = null
  }

  setPinValue(pin: string, value: number) {
    this.worker?.postMessage({ type: 'setPin', payload: { pin, value } })
  }

  destroy() {
    this.unsubscribeStore?.()
    this.unsubscribeStore = null
    this.worker?.terminate()
    this.worker = null
  }
}

let bridgeInstance: SimulationWorkerBridge | null = null

export function getSimulationBridge(): SimulationWorkerBridge {
  if (!bridgeInstance) {
    bridgeInstance = new SimulationWorkerBridge()
  }
  return bridgeInstance
}

export function destroySimulationBridge() {
  bridgeInstance?.destroy()
  bridgeInstance = null
}
