/** Shared project domain types — owned by contracts eventually; UI imports from here. */

export type ProjectStatus =
  | "draft"
  | "analyzing"
  | "design"
  | "code"
  | "testing"
  | "deploy"
  | "complete";

export type ReqPhase =
  | "input"
  | "parsing"
  | "entities"
  | "sag"
  | "architecture"
  | "uml"
  | "wireframes"
  | "sprint"
  | "done";

export type RequirementChatRole = "user" | "assistant";
export type RequirementChatType = "source_requirement" | "chat";

export interface RequirementChatMessage {
  id: string;
  role: RequirementChatRole;
  type: RequirementChatType;
  content: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  requirementText: string;
  requirementChat: RequirementChatMessage[];
  files: string[];
  reqPhase: ReqPhase;
  progress: number;
  techStack: string[];
  color: string;
}
