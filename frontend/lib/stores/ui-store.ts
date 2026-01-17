import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Theme
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;

  // Modals
  createModalOpen: boolean;
  setCreateModalOpen: (open: boolean) => void;

  // Environment context
  selectedEnvironment: string | null;
  setSelectedEnvironment: (env: string | null) => void;

  // Selected application
  selectedApplication: string | null;
  setSelectedApplication: (appId: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      theme: "dark",
      setTheme: (theme) => set({ theme }),

      createModalOpen: false,
      setCreateModalOpen: (open) => set({ createModalOpen: open }),

      selectedEnvironment: null,
      setSelectedEnvironment: (env) => set({ selectedEnvironment: env }),

      selectedApplication: null,
      setSelectedApplication: (appId) => set({ selectedApplication: appId }),
    }),
    {
      name: "devkit-ui-storage",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);
