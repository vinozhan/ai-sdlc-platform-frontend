import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { Project, ReqPhase } from "@/types/project";
import { projectsApi } from "@/entities/project";
import { useUiStore } from "@/store/ui";
import { cn } from "@/shared/utils/cn";
import { Card, CardContent } from "@/shared/ui/primitives";
import { ChevronStepper } from "@/shared/ui/ChevronStepper";
import { PhaseSectionHeader, surface } from "@/shared/ui";
import { getPhaseProgress } from "@/shared/model";
import { useRequirementsPipeline } from "../hooks";
import { RequirementsChat } from "./RequirementsChat";
import { EntitiesPanel } from "./EntitiesPanel";
import { SagCanvas } from "./SagCanvas";
import { ArchitecturePanel } from "./ArchitecturePanel";
import { UMLPanel } from "./UMLPanel";
import { WireframesPanel } from "./WireframesPanel";
import { SprintBoard } from "./SprintBoard";

const phaseMeta: { id: ReqPhase; label: string }[] = [
  { id: "input", label: "Input" },
  { id: "parsing", label: "Parsing" },
  { id: "entities", label: "Entities" },
  { id: "sag", label: "SAG Graph" },
  { id: "architecture", label: "Architecture" },
  { id: "uml", label: "UML" },
  { id: "wireframes", label: "Wireframes" },
  { id: "sprint", label: "Sprint" },
  { id: "done", label: "Done" },
];

export function RequirementsResults({ project }: { project: Project }) {
  const theme = useUiStore((s) => s.theme);
  const addToast = useUiStore((s) => s.addToast);
  const pipelineRunning = useRequirementsPipeline((s) => s.pipelineRunning);
  const isDark = theme === "dark";
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const steps = phaseMeta.filter((p) => p.id !== "input");
  const progressId = project.reqPhase === "done" ? "done" : project.reqPhase;
  const isPipelineComplete = project.reqPhase === "done";
  const activeStep = selectedStep ?? (isPipelineComplete ? "done" : null);

  return (
    <div className="w-full space-y-5 p-4 sm:p-6 md:p-8">
      <PhaseSectionHeader
        title="Requirements & Design"
        subtitle={
          pipelineRunning
            ? "AI is generating design artifacts from your requirements..."
            : "Generated from your requirements input"
        }
        progress={getPhaseProgress(project, "requirements")}
        isDark={isDark}
      />

      <ChevronStepper
        steps={steps}
        progressId={progressId}
        selectedId={activeStep}
        isDark={isDark}
        onStepClick={setSelectedStep}
      />

      {!activeStep && (
        <div className={cn("rounded-xl border border-dashed px-6 py-10 text-center", surface.dashed(isDark))}>
          <Sparkles className="mx-auto mb-2 h-5 w-5 text-blue-400" />
          <p className="text-sm">Select a step above to view generated artifacts</p>
        </div>
      )}

      {activeStep === "parsing" && <RequirementsChat project={project} isDark={isDark} />}
      {activeStep === "entities" && <EntitiesPanel isDark={isDark} />}
      {activeStep === "sag" && <SagCanvas isDark={isDark} />}
      {activeStep === "architecture" && <ArchitecturePanel isDark={isDark} />}
      {activeStep === "uml" && <UMLPanel isDark={isDark} />}
      {activeStep === "wireframes" && (
        <WireframesPanel
          isDark={isDark}
          onApprove={() => setSelectedStep("sprint")}
          onRequestRefinement={(feedback, wireframeName) => {
            const entry = `[Wireframe refinement - ${wireframeName}]\n${feedback}`;
            void projectsApi.update(project.id, {
              requirementText: `${project.requirementText.trim()}\n\n${entry}`,
            });
            addToast({
              type: "info",
              title: "Refinement submitted",
              message: `Feedback for "${wireframeName}" added to requirements. AI will regenerate wireframes.`,
            });
            setSelectedStep("parsing");
          }}
        />
      )}
      {activeStep === "sprint" && <SprintBoard isDark={isDark} />}
      {activeStep === "done" && (
        <Card>
          <CardContent className="flex flex-col items-center px-6 py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <Sparkles className="h-7 w-7 text-emerald-500" />
            </div>
            <h4 className={cn("text-lg font-semibold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
              Design pipeline complete
            </h4>
            <p className={cn("mt-2 max-w-md text-sm leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>
              All requirements & design artifacts have been generated. Proceed to Code Generation to continue.
            </p>
          </CardContent>
        </Card>
      )}

      {pipelineRunning && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl",
            isDark ? "border-white/10 bg-[#0f1d32]" : "border-slate-200 bg-white"
          )}
        >
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className={cn("text-sm font-medium", isDark ? "text-slate-200" : "text-slate-700")}>
            Running design pipeline…
          </span>
        </div>
      )}
    </div>
  );
}
