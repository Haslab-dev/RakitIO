import { create } from 'zustand';
import type { SimulationState, SimulationEvent, SimulationSnapshot, SimulationConfig } from '../types';

interface SimulationStore {
  state: SimulationState;
  serialOutput: string[];
  events: SimulationEvent[];
  snapshot: SimulationSnapshot | null;
  config: SimulationConfig;
  variables: Record<string, any>;
  callStack: string[];
  currentLine: number | null;
  history: any[];
  historyIndex: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  step: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  addSerialOutput: (text: string) => void;
  clearSerial: () => void;
  setSnapshot: (snapshot: any) => void;
  addEvent: (event: SimulationEvent) => void;
  setState: (state: SimulationState) => void;
  setHistoryIndex: (index: number) => void;
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
    enableDebug: true,
    breakpoints: [],
  },
  variables: {},
  callStack: [],
  currentLine: null,
  history: [],
  historyIndex: -1,

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
      variables: {},
      callStack: [],
      currentLine: null,
      history: [],
      historyIndex: -1,
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
  setSnapshot: (snapshot) =>
    set((s) => {
      // If we are scrubbing history, don't append new snapshots
      if (s.historyIndex !== -1 && s.historyIndex < s.history.length - 1) {
        return {};
      }
      const newHistory = [...s.history, snapshot].slice(-100);
      return {
        snapshot,
        variables: snapshot.variables || {},
        callStack: snapshot.callStack || [],
        currentLine: snapshot.currentLine ?? null,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),
  setState: (state) => set({ state }),
  setHistoryIndex: (index) =>
    set((s) => {
      const snap = s.history[index];
      if (!snap) return {};
      return {
        historyIndex: index,
        snapshot: snap,
        variables: snap.variables || {},
        callStack: snap.callStack || [],
        currentLine: snap.currentLine ?? null,
      };
    }),
}));
