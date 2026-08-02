import { Play } from "lucide-react";
import { Button } from "@/shared/ui/primitives";
import { ChevronStepper } from "@/shared/ui/ChevronStepper";
import { PhaseSectionHeader } from "@/shared/ui";
import type { StepId } from "../model/view";
import { StickyHeader } from "./PhaseChrome";

type StepperStep = { id: string; label: string; badge?: number };

export function TestingHeader({
  progress,
  isDark,
  running,
  onRerun,
}: {
  progress: number;
  isDark: boolean;
  running: boolean;
  onRerun: () => void;
}) {
  return (
    <PhaseSectionHeader
      title="Testing & Security"
      subtitle="Tests are written from the requirements, run, and triaged. Every repair and every fix has to prove itself before you approve the phase."
      progress={progress}
      isDark={isDark}
      action={
        <Button variant="outline" onClick={onRerun} disabled={running}>
          <Play className="h-3.5 w-3.5" />
          {running ? "Running…" : "Run tests again"}
        </Button>
      }
    />
  );
}

export function TestingStepper({
  steps,
  progressId,
  selectedId,
  isDark,
  onStepClick,
}: {
  steps: StepperStep[];
  progressId: string;
  selectedId: StepId;
  isDark: boolean;
  onStepClick: (id: StepId) => void;
}) {
  return (
    <StickyHeader>
      <ChevronStepper
        steps={steps}
        progressId={progressId}
        selectedId={selectedId}
        isDark={isDark}
        onStepClick={(id) => onStepClick(id as StepId)}
      />
    </StickyHeader>
  );
}
