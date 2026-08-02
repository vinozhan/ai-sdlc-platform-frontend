import type { Project, ReqPhase } from "@/types/project";

const reqPhaseOrder: ReqPhase[] = [
  "input",
  "parsing",
  "entities",
  "sag",
  "architecture",
  "uml",
  "wireframes",
  "sprint",
  "done",
];

export type ProjectPhase = "requirements" | "code" | "testing" | "deployment" | "activity";

/** Domain progress derivation for SDLC phases — not UI. */
export function getPhaseProgress(project: Project, phase: ProjectPhase): number {
  switch (phase) {
    case "requirements": {
      if (project.reqPhase === "done") return 100;
      const idx = reqPhaseOrder.indexOf(project.reqPhase);
      if (idx <= 0) return 0;
      return Math.round((idx / (reqPhaseOrder.length - 1)) * 100);
    }
    case "code":
      if (["testing", "deploy", "complete"].includes(project.status)) return 100;
      if (project.status === "code") return 72;
      if (project.status === "design") return 18;
      return 0;
    case "testing":
      if (["deploy", "complete"].includes(project.status)) return 100;
      if (project.status === "testing") return 68;
      return 0;
    case "deployment":
      if (project.status === "complete") return 100;
      // Deploy status ⇒ providers connected + pre-flight (stages 1–2 ≈ 40%). Cap until live.
      if (project.status === "deploy") return 40;
      return 0;
    case "activity":
      return project.progress;
    default:
      return project.progress;
  }
}
