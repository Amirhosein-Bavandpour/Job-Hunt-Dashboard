import { create } from 'zustand';

// EPHEMERAL UI state -> Zustand.
// Not business state (Redux) and not server state (RTK Query).
// Examples: sidebar open/close, kanban UI mode, active dashboard layout.
interface DashboardUIState {
  sidebarOpen: boolean;
  kanbanMode: boolean;
  toggleSidebar: () => void;
  // Explicit setter (not just a toggle) so layout code can force the drawer shut —
  // e.g. after navigating on mobile, where a toggle would be a no-op if state drifted.
  setSidebarOpen: (v: boolean) => void;
  setKanbanMode: (v: boolean) => void;
}

export const useDashboardUIStore = create<DashboardUIState>((set) => ({
  sidebarOpen: true,
  kanbanMode: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setKanbanMode: (v) => set({ kanbanMode: v }),
}));
