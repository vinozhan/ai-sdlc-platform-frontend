import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import type { Theme } from "@/types/ui";

/** Prefer this in shared/ — never import Zustand stores from shared. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export function useIsDark(): boolean {
  return useTheme() === "dark";
}
