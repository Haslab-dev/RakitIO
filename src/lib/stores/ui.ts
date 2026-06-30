import { create } from 'zustand';

export type PanelTab = 'files' | 'components' | 'ai' | 'ai-settings';
export type BottomTab = 'serial' | 'variables' | 'logic' | 'output' | 'problems';

interface SelectionInfo {
  type: 'component' | 'wire' | 'pin';
  id: string;
}

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  sidebarWidth: number;
  activePanel: PanelTab;
  bottomPanelOpen: boolean;
  bottomPanelHeight: number;
  activeBottomTab: BottomTab;
  activeFileId: string | null;
  zoom: number;
  panX: number;
  panY: number;
  selection: SelectionInfo | null;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarWidth: (w: number) => void;
  setActivePanel: (tab: PanelTab) => void;
  toggleBottomPanel: () => void;
  setBottomPanelHeight: (h: number) => void;
  setActiveBottomTab: (tab: BottomTab) => void;
  setActiveFile: (id: string | null) => void;
  setZoom: (z: number) => void;
  setPan: (x: number, y: number) => void;
  setSelection: (sel: SelectionInfo | null) => void;
  clearSelection: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: (localStorage.getItem('rakit_theme') as 'light' | 'dark') ?? 'dark',
  sidebarOpen: true,
  sidebarWidth: 260,
  activePanel: 'files',
  bottomPanelOpen: true,
  bottomPanelHeight: 200,
  activeBottomTab: 'serial',
  activeFileId: null,
  zoom: 1,
  panX: 0,
  panY: 0,
  selection: null,

  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('rakit_theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return { theme: next };
    }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarWidth: (w) => set({ sidebarWidth: w }),
  setActivePanel: (tab) => set({ activePanel: tab }),
  toggleBottomPanel: () => set((s) => ({ bottomPanelOpen: !s.bottomPanelOpen })),
  setBottomPanelHeight: (h) => set({ bottomPanelHeight: h }),
  setActiveBottomTab: (tab) => set({ activeBottomTab: tab, bottomPanelOpen: true }),
  setActiveFile: (id) => set({ activeFileId: id }),
  setZoom: (z) => set({ zoom: Math.max(0.1, Math.min(5, z)) }),
  setPan: (x, y) => set({ panX: x, panY: y }),
  setSelection: (sel) => set({ selection: sel }),
  clearSelection: () => set({ selection: null }),
}));
