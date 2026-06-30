import { create } from 'zustand';
import type { SimulationState, SimulationEvent, SimulationSnapshot, SimulationConfig } from '../types';

interface SimulationStore {
  state: SimulationState;
  serialOutput: string[];
  events: SimulationEvent[];
  snapshot: SimulationSnapshot | null;
  config: SimulationConfig;
  start: () => void;
  pause: () => void;
  resume: () => void;
  step: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  addSerialOutput: (text: string) => void;
  clearSerial: () => void;
  setSnapshot: (snapshot: SimulationSnapshot) => void;
  addEvent: (event: SimulationEvent) => void;
  setState: (state: SimulationState) => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  state: 'idle',
  serialOutput: [],
  events: [],
  snapshot: null,
  config: {
    speed: 1,
    maxCyclesPerStep: 1000,
    enableSerial: true,
    enableDebug: false,
    breakpoints: [],
  },

  start: () => set({ state: 'running' }),
  pause: () => set({ state: 'paused' }),
  resume: () => set({ state: 'running' }),
  step: () => {
    set({ state: 'stepping' })
    setTimeout(() => {
      set((s) => ({ state: s.state === 'stepping' ? 'paused' : s.state }))
    }, 50)
  },
  reset: () =>
    set({
      state: 'idle',
      serialOutput: [],
      events: [],
      snapshot: null,
    }),
  setSpeed: (speed) =>
    set((state) => ({
      config: { ...state.config, speed },
    })),
  addSerialOutput: (text) =>
    set((state) => ({
      serialOutput: [...state.serialOutput, text.replace(/\n$/, '')],
    })),
  clearSerial: () => set({ serialOutput: [] }),
  setSnapshot: (snapshot) => set({ snapshot }),
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),
  setState: (state) => set({ state }),
}));
