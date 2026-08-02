import { useState } from "react";
import { useParams } from "react-router-dom";
import type { ProjectStatus } from "@/types/project";
import { ChevronStepper } from "@/shared/ui/ChevronStepper";
import { PhaseSectionHeader } from "@/shared/ui";
import { getPhaseProgress } from "@/shared/model";
import { useSessionStore } from "@/store/session";
import { useUiStore } from "@/store/ui";
import { useProject } from "@/entities/project";
import { CodeWorkspace } from "./components";

const codePhaseSteps = [
  { id: "scope", label: "Backlog" },
  { id: "techstack", label: "Tech Stack" },
  { id: "contract", label: "API Contracts" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "build", label: "Build" },
];

function getCodeProgressId(status: ProjectStatus): string {
  switch (status) {
    case "complete":
    case "deploy":
    case "testing":
      return "done";
    case "code":
      return "build";
    case "design":
      return "techstack";
    case "analyzing":
      return "scope";
    default:
      return "scope";
  }
}

export function CodeGeneration() {
  const { projectId } = useParams();
  const theme = useUiStore((s) => s.theme);
  const activeProjectId = useSessionStore((s) => s.activeProjectId);
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("scope");

  const project = useProject(activeProjectId ?? projectId);

  const progressId = project ? getCodeProgressId(project.status) : activeTab;

  return (
    <div className="w-full space-y-5 p-4 sm:p-6 md:p-8">
      <PhaseSectionHeader
        title="Code Generation"
        subtitle={
          project && ["deploy", "complete", "testing"].includes(project.status)
            ? "All code generation stages complete - browse any step below"
            : "AI-generated frontend, backend, and build artifacts from your requirements"
        }
        progress={project ? getPhaseProgress(project, "code") : 0}
        isDark={isDark}
      />

      <ChevronStepper
        steps={codePhaseSteps}
        progressId={progressId}
        selectedId={activeTab}
        isDark={isDark}
        onStepClick={setActiveTab}
      />

      <CodeWorkspace activeTab={activeTab} />
    </div>
  );
}

export default CodeGeneration;
