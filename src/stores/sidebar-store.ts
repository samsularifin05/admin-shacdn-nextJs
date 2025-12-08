import { create } from "zustand";

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  activeSection: string | null;
  toggleCollapse: () => void;
  toggleMobile: () => void;
  setActiveSection: (section: string | null) => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  activeSection: null,

  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

  toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),

  setActiveSection: (section: string | null) => set({ activeSection: section }),

  closeMobile: () => set({ isMobileOpen: false }),
}));
