import type { ReactNode } from "react";
import { Link, Navigate, useParams, useLocation } from "react-router-dom";
import {
  Code2,
  FileText,
  FlaskConical,
  GitBranch,
  Rocket,
} from "lucide-react";
import type { Project } from "@/types/project";
import { useProject as useProjectById } from "@/features/projects";
import { useUiStore } from "@/store/ui";
import { cn } from "@/shared/utils/cn";
import { Badge } from "@/shared/ui/primitives";

function statusBadge(status: Project["status"]) {
  switch (status) {
    case "draft":
      return { label: "Draft", variant: "default" as const };
    case "analyzing":
      return { label: "Analyzing", variant: "info" as const };
    case "design":
      return { label: "Design", variant: "c1" as const };
    case "code":
      return { label: "Code", variant: "c2" as const };
    case "testing":
      return { label: "Testing", variant: "c3" as const };
    case "deploy":
      return { label: "Deploy", variant: "c4" as const };
    case "complete":
      return { label: "Complete", variant: "success" as const };
    default:
      return { label: status, variant: "default" as const };
  }
}

function useShellProject() {
  const { projectId } = useParams();
  const project = useProjectById(projectId);
  return { projectId: projectId!, project };
}

function ProjectShell({ children }: { children: ReactNode }) {
  const { project, projectId } = useShellProject();
  const theme = useUiStore((s) => s.theme);
  const isDark = theme === "dark";
  const location = useLocation();
  const locationPath = location.pathname;

  if (!project) return <Navigate to="/projects" replace />;

  const tabs = [
    { id: "requirements", label: "Requirements & Design", path: `/projects/${projectId}/requirements`, icon: FileText },
    { id: "code", label: "Code Generation", path: `/projects/${projectId}/code`, icon: Code2 },
    { id: "testing", label: "Testing & Security", path: `/projects/${projectId}/testing`, icon: FlaskConical },
    { id: "deployment", label: "Deployment", path: `/projects/${projectId}/deployment`, icon: Rocket },
    { id: "traceability", label: "Activity Log", path: `/projects/${projectId}/traceability`, icon: GitBranch },
  ];

  const status = statusBadge(project.status);
  const description =
    project.description.trim() ||
    "AI-assisted SDLC pipeline from requirements through design, code, testing, and deployment.";

  return (
    <div className="flex min-h-full flex-col">
      {/* Main project header */}
      <div
        className={cn(
          "border-b px-6 py-5 md:px-8",
          isDark ? "border-white/[0.06] bg-[#0a1628]/40" : "border-slate-200/80 bg-white/80"
        )}
      >
        <div className="flex flex-wrap items-start gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-md"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className={cn("text-xl font-semibold tracking-tight md:text-2xl", isDark ? "text-white" : "text-slate-900")}>
                {project.name}
              </h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className={cn("mt-1.5 max-w-3xl text-sm leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>
              {description}
            </p>
            {project.techStack.length > 0 && (
              <p className={cn("mt-2 text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                {project.techStack.join(" · ")}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className={cn("text-2xl font-bold tabular-nums", isDark ? "text-white" : "text-slate-900")}>
              {project.progress}%
            </p>
            <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>Overall progress</p>
          </div>
        </div>
      </div>

      {/* Phase navigation */}
      <div
        className={cn(
          "sticky top-0 z-20 border-b backdrop-blur-xl md:px-8",
          isDark ? "border-white/[0.06] bg-[#071018]/95" : "border-slate-200/80 bg-white/95"
        )}
      >
        <nav className="-mb-px flex gap-0 overflow-x-auto px-4 md:px-0">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = locationPath.includes(`/${t.id}`);
            return (
              <Link
                key={t.id}
                to={t.path}
                className={cn(
                  "group relative flex shrink-0 items-center gap-2.5 border-b-2 px-4 py-3.5 text-[13px] font-medium transition-all",
                  active
                    ? isDark
                      ? "border-blue-500 text-blue-400"
                      : "border-blue-600 text-blue-700"
                    : isDark
                    ? "border-transparent text-slate-500 hover:border-white/10 hover:text-slate-300"
                    : "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-800"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                    active
                      ? isDark
                        ? "bg-blue-500/15 text-blue-400"
                        : "bg-blue-50 text-blue-600"
                      : isDark
                      ? "text-slate-500 group-hover:bg-white/[0.04] group-hover:text-slate-400"
                      : "text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className={cn(active && "font-semibold")}>{t.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}

export { ProjectShell };
