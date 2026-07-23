import { create } from "zustand";

type UIState = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  pageTitle: string;
  pageSubtitle: string;
  setPageHeader: (title: string, subtitle?: string) => void;
};

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  pageTitle: "Dashboard",
  pageSubtitle: "",
  setPageHeader: (title, subtitle = "") => set({ pageTitle: title, pageSubtitle: subtitle }),
}));
