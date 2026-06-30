import { create } from 'zustand';

export type PanelTab = 'files' | 'components' | 'ai';
export type BottomTab = 'serial' | 'output' | 'problems';

interface SelectionInfo {
  type: 'component' | 'wire' | 'pin';
  id: string;
}

interface UIState {
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
