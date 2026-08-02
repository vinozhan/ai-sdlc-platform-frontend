/**
 * UI prefs slice: theme, sidebar, toasts, command palette.
 * Server entity caches do not belong here — use TanStack Query.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme } from "@/types/ui";

export type { Theme };
export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
  localStorage.setItem("sdlc-theme", theme);
}

const getInitialTheme = (): Theme => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("sdlc-theme");
    if (saved === "light" || saved === "dark") return saved;
  }
  return "light";
};

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export interface UiState {
  theme: Theme;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  toasts: Toast[];
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  /** @deprecated use addToast */
  pushToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => {
      const addToast = (toast: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).slice(2);
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 4000);
      };

      return {
        theme: initialTheme,
        sidebarCollapsed: false,
        commandPaletteOpen: false,
        toasts: [],
        setTheme: (theme) => {
          applyTheme(theme);
          set({ theme });
        },
        toggleTheme: () => {
          const theme = get().theme === "dark" ? "light" : "dark";
          applyTheme(theme);
          set({ theme });
        },
        toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
        setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
        addToast,
        pushToast: addToast,
        removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
        dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      };
    },
    {
      name: "nexus-ui",
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyTheme(state.theme);
      },
    },
  ),
);
