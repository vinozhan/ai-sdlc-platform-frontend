import { create } from "zustand";
import type { ProjectStatus, ReqPhase } from "@/types/project";
import { projectsApi } from "@/entities/project";
import { useUiStore } from "@/store/ui";

const phaseOrder: ReqPhase[] = [
  "parsing",
  "entities",
  "sag",
  "architecture",
  "uml",
  "wireframes",
  "sprint",
  "done",
];

interface PipelineState {
  pipelineRunning: boolean;
  setPipelineRunning: (v: boolean) => void;
  startRequirementsPipeline: (projectId: string, text: string, files?: string[]) => void;
}

export const useRequirementsPipeline = create<PipelineState>((set, get) => ({
  pipelineRunning: false,
  setPipelineRunning: (pipelineRunning) => set({ pipelineRunning }),

  startRequirementsPipeline: (projectId, text, files = []) => {
    const { setPipelineRunning } = get();
    const addToast = useUiStore.getState().addToast;

    setPipelineRunning(true);
    void projectsApi.update(projectId, {
      requirementText: text,
      files,
      reqPhase: "parsing",
      status: "analyzing",
      progress: 8,
    });
    addToast({ type: "info", title: "Analyzing requirements", message: "AI pipeline started" });

    let step = 0;
    const tick = () => {
      step += 1;
      const phase = phaseOrder[Math.min(step, phaseOrder.length - 1)];
      const progress = Math.min(100, Math.round((step / (phaseOrder.length - 1)) * 100));
      const status: ProjectStatus =
        phase === "done"
          ? "design"
          : phase === "parsing" || phase === "entities"
            ? "analyzing"
            : "design";

      void projectsApi.update(projectId, {
        reqPhase: phase,
        progress,
        status,
        techStack: step >= 3 ? ["React", "Spring Boot", "PostgreSQL"] : [],
      });

      if (phase === "done") {
        setPipelineRunning(false);
        addToast({
          type: "success",
          title: "Requirements complete",
          message: "Architecture, UML, wireframes, and sprint plan are ready",
        });
        return;
      }

      setTimeout(tick, 1400);
    };

    setTimeout(tick, 1400);
  },
}));
