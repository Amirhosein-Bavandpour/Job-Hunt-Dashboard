import { create } from 'zustand';

// EPHEMERAL UI state -> Zustand.
// Not business state (Redux) and not server state (RTK Query).
// Examples: sidebar open/close, kanban UI mode, active dashboard layout.
interface DashboardUIState {
  sidebarOpen: boolean;
  kanbanMode: boolean;
  toggleSidebar: () => void;
  setKanbanMode: (v: boolean) => void;
}

export const useDashboardUIStore = create<DashboardUIState>((set) => ({
  sidebarOpen: true,
  kanbanMode: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setKanbanMode: (v) => set({ kanbanMode: v }),
}));
