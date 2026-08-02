import type { Project, RequirementChatMessage } from "@/types/project";
import { MOCK_PROJECTS, PROJECT_COLORS } from "./fixtures";
import { env } from "@/lib/env";
import { http } from "@/lib/http";

export interface ProjectsApi {
  list(): Promise<Project[]>;
  get(id: string): Promise<Project | undefined>;
  create(name: string, description?: string): Promise<Project>;
  update(id: string, patch: Partial<Project>): Promise<Project | undefined>;
  delete(id: string): Promise<void>;
  appendRequirementChatMessage(
    projectId: string,
    message: Omit<RequirementChatMessage, "id" | "createdAt">,
  ): Promise<Project | undefined>;
}

type Listener = () => void;

let projectsDb: Project[] = structuredClone(MOCK_PROJECTS);
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeProjects(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProjectsSnapshot(): Project[] {
  return projectsDb;
}

function createFixtureProjectsApi(): ProjectsApi {
  return {
    async list() {
      return structuredClone(projectsDb);
    },
    async get(id) {
      return structuredClone(projectsDb.find((p) => p.id === id));
    },
    async create(name, description = "") {
      const id = `proj_${Date.now().toString(36)}`;
      const now = new Date().toISOString();
      const color = PROJECT_COLORS[projectsDb.length % PROJECT_COLORS.length];
      const project: Project = {
        id,
        name: name.trim(),
        description,
        status: "draft",
        createdAt: now,
        updatedAt: now,
        requirementText: "",
        files: [],
        requirementChat: [],
        reqPhase: "input",
        progress: 0,
        techStack: [],
        color,
      };
      projectsDb = [project, ...projectsDb];
      emit();
      return structuredClone(project);
    },
    async update(id, patch) {
      let updated: Project | undefined;
      projectsDb = projectsDb.map((p) => {
        if (p.id !== id) return p;
        updated = { ...p, ...patch, updatedAt: new Date().toISOString() };
        return updated;
      });
      emit();
      return updated ? structuredClone(updated) : undefined;
    },
    async delete(id) {
      projectsDb = projectsDb.filter((p) => p.id !== id);
      emit();
    },
    async appendRequirementChatMessage(projectId, message) {
      let updated: Project | undefined;
      projectsDb = projectsDb.map((p) => {
        if (p.id !== projectId) return p;
        const entry: RequirementChatMessage = {
          ...message,
          id: `chat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
        };
        const chat = [...(p.requirementChat ?? []), entry];
        const requirementText =
          message.type === "source_requirement" && message.role === "user"
            ? p.requirementText.trim()
              ? `${p.requirementText.trim()}\n\n${message.content}`
              : message.content
            : p.requirementText;
        updated = { ...p, requirementChat: chat, requirementText, updatedAt: entry.createdAt };
        return updated;
      });
      emit();
      return updated ? structuredClone(updated) : undefined;
    },
  };
}

function createHttpProjectsApi(): ProjectsApi {
  return {
    list: () => http.get<Project[]>("/projects"),
    get: (id) => http.get<Project>(`/projects/${id}`),
    create: (name, description = "") =>
      http.post<Project>("/projects", { name, description }),
    update: (id, patch) => http.patch<Project>(`/projects/${id}`, patch),
    delete: (id) => http.delete<void>(`/projects/${id}`),
    appendRequirementChatMessage: (projectId, message) =>
      http.post<Project>(`/projects/${projectId}/requirement-chat`, message),
  };
}

export const projectsApi: ProjectsApi = env.useFixtures
  ? createFixtureProjectsApi()
  : createHttpProjectsApi();
