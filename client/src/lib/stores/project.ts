import { create } from 'zustand';
import type { Project, ComponentInstance, WireConnection, WirePoint } from '../types';
import { api } from '../api';

interface ProjectSnapshot {
  project: Project;
}

interface ProjectState {
  project: Project | null;
  isDirty: boolean;
  history: ProjectSnapshot[];
  historyIndex: number;
  setProject: (project: Project) => void;
  updateCode: (fileId: string, code: string) => void;
  addComponent: (component: ComponentInstance) => void;
  removeComponent: (id: string) => void;
  moveComponent: (id: string, x: number, y: number) => void;
  addWire: (wire: WireConnection) => void;
  removeWire: (id: string) => void;
  updateWirePoints: (id: string, points: WirePoint[]) => void;
  updateSettings: (settings: Partial<Project['settings']>) => void;
  undo: () => void;
  redo: () => void;
  save: () => Promise<void>;
  load: (id: string) => Promise<void>;
  clear: () => void;
}

function pushHistory(state: ProjectState): Partial<ProjectState> {
  if (!state.project) return {};
  const snapshot: ProjectSnapshot = { project: structuredClone(state.project) };
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(snapshot);
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  isDirty: false,
  history: [],
  historyIndex: -1,

  setProject: (project) => {
    const snapshot: ProjectSnapshot = { project: structuredClone(project) };
    set({ project, isDirty: false, history: [snapshot], historyIndex: 0 });
  },

  updateCode: (fileId, code) => {
    const { project } = get();
    if (!project) return;
    const files = project.files.map((f) =>
      f.id === fileId ? { ...f, content: code, isDirty: true } : f,
    );
    set((state) => ({
      ...pushHistory(state),
      project: { ...project, files },
      isDirty: true,
    }));
  },

  addComponent: (component) => {
    const { project } = get();
    if (!project) return;
    set((state) => ({
      ...pushHistory(state),
      project: {
        ...project,
        components: [...project.components, component],
      },
      isDirty: true,
    }));
  },

  removeComponent: (id) => {
    const { project } = get();
    if (!project) return;
    set((state) => ({
      ...pushHistory(state),
      project: {
        ...project,
        components: project.components.filter((c) => c.id !== id),
        wires: project.wires.filter(
          (w) =>
            w.from?.componentId !== id &&
            w.to?.componentId !== id,
        ),
      },
      isDirty: true,
    }));
  },

  moveComponent: (id, x, y) => {
    const { project } = get();
    if (!project) return;
    const components = project.components.map((c) =>
      c.id === id ? { ...c, x, y } : c,
    );
    set((state) => ({
      ...pushHistory(state),
      project: { ...project, components },
      isDirty: true,
    }));
  },

  addWire: (wire) => {
    const { project } = get();
    if (!project) return;
    set((state) => ({
      ...pushHistory(state),
      project: {
        ...project,
        wires: [...project.wires, wire],
      },
      isDirty: true,
    }));
  },

  removeWire: (id) => {
    const { project } = get();
    if (!project) return;
    set((state) => ({
      ...pushHistory(state),
      project: {
        ...project,
        wires: project.wires.filter((w) => w.id !== id),
      },
      isDirty: true,
    }));
  },

  updateWirePoints: (id, points) => {
    const { project } = get();
    if (!project) return;
    const wires = project.wires.map((w) =>
      w.id === id ? { ...w, points } : w,
    );
    set((state) => ({
      ...pushHistory(state),
      project: { ...project, wires },
      isDirty: true,
    }));
  },

  updateSettings: (settings) => {
    const { project } = get();
    if (!project) return;
    set((state) => ({
      ...pushHistory(state),
      project: {
        ...project,
        settings: { ...project.settings, ...settings },
      },
      isDirty: true,
    }));
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const snapshot = history[newIndex];
    set({
      project: structuredClone(snapshot.project),
      historyIndex: newIndex,
      isDirty: true,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const snapshot = history[newIndex];
    set({
      project: structuredClone(snapshot.project),
      historyIndex: newIndex,
      isDirty: true,
    });
  },

  save: async () => {
    const { project } = get();
    if (!project) return;
    await api.projects.update(project.id, {
      files: project.files,
      components: project.components,
      wires: project.wires,
      settings: project.settings,
    });
    set({ isDirty: false });
  },

  load: async (id) => {
    const data = await api.projects.get(id);
    const project = data as unknown as Project;
    get().setProject(project);
  },

  clear: () => {
    set({ project: null, isDirty: false, history: [], historyIndex: -1 });
  },
}));
