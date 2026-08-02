import { env } from "@/lib/env";
import { http } from "@/lib/http";
import type { Project } from "@/types/project";

/** Requirements (C1) API seam — pipeline mutations stay on entities until orchestrator lands. */
export interface RequirementsApi {
  getProjectDesign(projectId: string): Promise<{ reqPhase: Project["reqPhase"]; progress: number }>;
}

function createFixtureApi(): RequirementsApi {
  return {
    async getProjectDesign(projectId) {
      const { projectsApi } = await import("@/entities/project");
      const project = await projectsApi.get(projectId);
      return {
        reqPhase: project?.reqPhase ?? "input",
        progress: project?.progress ?? 0,
      };
    },
  };
}

function createHttpApi(): RequirementsApi {
  return {
    getProjectDesign: (projectId) =>
      http.get<{ reqPhase: Project["reqPhase"]; progress: number }>(
        `/projects/${projectId}/requirements/design`,
      ),
  };
}

export const requirementsApi: RequirementsApi = env.useFixtures
  ? createFixtureApi()
  : createHttpApi();
