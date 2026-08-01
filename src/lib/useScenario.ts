import { useSyncExternalStore } from "react";
import { getScenario, onScenarioChange } from "@/lib/orchestrator";

/**
 * The demo scenario, read as state. Only the fixtures layer has this concept:
 * when the orchestrator is real, this hook and its callers disappear together.
 */
export function useScenario() {
  return useSyncExternalStore(onScenarioChange, getScenario, getScenario);
}
