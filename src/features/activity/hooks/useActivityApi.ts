import { useSyncExternalStore } from "react";
import type { ActivityLogEntry } from "../fixtures/activityData";
import { activityApi } from "../api";

let cache: ActivityLogEntry[] | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ActivityLogEntry[] {
  return cache ?? [];
}

void activityApi.list().then((entries) => {
  cache = entries;
  listeners.forEach((l) => l());
});

export function useActivityLog(): ActivityLogEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
