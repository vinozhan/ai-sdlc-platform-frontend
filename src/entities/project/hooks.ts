import { useSyncExternalStore } from "react";
import type { Project } from "@/types/project";
import { projectsApi, subscribeProjects, getProjectsSnapshot } from "./api";

export function useProjectsList(): Project[] {
  return useSyncExternalStore(subscribeProjects, getProjectsSnapshot, getProjectsSnapshot);
}

export function useProject(id: string | null | undefined): Project | undefined {
  const projects = useProjectsList();
  if (!id) return undefined;
  return projects.find((p) => p.id === id);
}

export { projectsApi };
