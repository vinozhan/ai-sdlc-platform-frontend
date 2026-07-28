import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Progress } from "@/components/ui/primitives";
import type { Project, ReqPhase } from "@/store/useStore";

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
      if (project.status === "deploy") return 84;
      return 0;
    case "activity":
      return project.progress;
    default:
      return project.progress;
  }
}

export function PhaseSectionHeader({
  title,
  subtitle,
  progress,
  isDark,
  action,
  showProgress = true,
}: {
  title: string;
  subtitle: string;
  progress: number;
  isDark: boolean;
  action?: ReactNode;
  showProgress?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h3 className={cn("text-lg font-semibold sm:text-xl", isDark ? "text-white" : "text-slate-900")}>
          {title}
        </h3>
        <p className={cn("mt-1 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
          {subtitle}
        </p>
      </div>
      <div className="flex w-full shrink-0 items-start gap-3 sm:w-auto">
        {showProgress && (
          <div className="w-full sm:w-48">
            <div className="mb-1 flex justify-between text-xs">
              <span className={isDark ? "text-slate-500" : "text-slate-400"}>Progress</span>
              <span className={cn("tabular-nums font-medium", isDark ? "text-white" : "text-slate-900")}>
                {progress}%
              </span>
            </div>
            <Progress value={progress} color="#2563eb" />
          </div>
        )}
        {action}
      </div>
    </div>
  );
}
