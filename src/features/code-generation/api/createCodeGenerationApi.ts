import { env } from "@/lib/env";
import { http } from "@/lib/http";

/** Code-generation API seam — swap fixture branch for orchestrator C2. */
export interface CodeGenerationApi {
  getTechStack(projectId: string): Promise<string[]>;
}

function createFixtureApi(): CodeGenerationApi {
  return {
    async getTechStack() {
      return ["React", "Spring Boot", "PostgreSQL"];
    },
  };
}

function createHttpApi(): CodeGenerationApi {
  return {
    getTechStack: (projectId) => http.get<string[]>(`/projects/${projectId}/code/tech-stack`),
  };
}

export const codeGenerationApi: CodeGenerationApi = env.useFixtures
  ? createFixtureApi()
  : createHttpApi();
