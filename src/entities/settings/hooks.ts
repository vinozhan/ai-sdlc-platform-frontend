import { useSyncExternalStore } from "react";
import type { SettingsState } from "@/types/settings";
import {
  settingsApi,
  subscribeSettings,
  getSettingsSnapshot,
} from "./api";

export function useSettings(): SettingsState {
  return useSyncExternalStore(subscribeSettings, getSettingsSnapshot, getSettingsSnapshot);
}

export function useSettingsActions() {
  return {
    updateSettings: (patch: Partial<SettingsState>) => settingsApi.update(patch),
    updateGitSettings: (patch: Partial<SettingsState["git"]>) => settingsApi.updateGit(patch),
    updateVercelSettings: (patch: Partial<SettingsState["vercel"]>) =>
      settingsApi.updateVercel(patch),
    updateAzureSettings: (patch: Partial<SettingsState["azure"]>) => settingsApi.updateAzure(patch),
    updateDatabaseSettings: (patch: Partial<SettingsState["database"]>) =>
      settingsApi.updateDatabase(patch),
    updateAiSettings: (patch: Partial<SettingsState["ai"]>) => settingsApi.updateAi(patch),
    updateProfile: (patch: Partial<SettingsState["profile"]>) => settingsApi.updateProfile(patch),
  };
}
