import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  FolderKanban,
  Clock,
  Trash2,
  ArrowRight,
  LayoutGrid,
  List,
} from "lucide-react";
import { useStore, type Project } from "@/store/useStore";
import { cn } from "@/utils/cn";
import { Badge, Button, Card, CardContent } from "@/components/ui/primitives";

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

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function Projects() {
  const navigate = useNavigate();
  const { theme, projects, deleteProject, setActiveProjectId, addToast } = useStore();
  const isDark = theme === "dark";
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.requirementText.toLowerCase().includes(q)
    );
  }, [projects, query]);

  const openProject = (p: Project) => {
    setActiveProjectId(p.id);
    navigate(`/projects/${p.id}/requirements`);
  };

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 md:p-8">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <FolderKanban className={cn("h-5 w-5", isDark ? "text-blue-400" : "text-blue-600")} />
          <h2 className={cn("text-2xl font-semibold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
            Projects
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div
          className={cn(
            "flex h-10 flex-1 items-center gap-2 rounded-xl border px-3 sm:max-w-sm",
            isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white"
          )}
        >
          <Search className={cn("h-4 w-4", isDark ? "text-slate-500" : "text-slate-400")} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects"
            className={cn(
              "w-full bg-transparent text-sm outline-none",
              isDark ? "text-slate-200 placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"
            )}
          />
        </div>
        <div
          className={cn(
            "flex rounded-xl border p-1",
            isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white"
          )}
        >
          <button
            onClick={() => setView("grid")}
            className={cn(
              "rounded-lg p-2",
              view === "grid"
                ? isDark
                  ? "bg-white/10 text-white"
                  : "bg-slate-100 text-slate-900"
                : isDark
                ? "text-slate-500"
                : "text-slate-400"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "rounded-lg p-2",
              view === "list"
                ? isDark
                  ? "bg-white/10 text-white"
                  : "bg-slate-100 text-slate-900"
                : isDark
                ? "text-slate-500"
                : "text-slate-400"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div
              className={cn(
                "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl",
                isDark ? "bg-white/5" : "bg-slate-100"
              )}
            >
              <FolderKanban className={cn("h-7 w-7", isDark ? "text-slate-500" : "text-slate-400")} />
            </div>
            <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
              {projects.length === 0 ? "No projects yet" : "No matching projects"}
            </h3>
            <p className={cn("mt-2 max-w-md text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
              {projects.length === 0
                ? "Create your first project to start requirements analysis and the full AI-assisted SDLC pipeline."
                : "Try a different search term."}
            </p>
            {projects.length === 0 && (
              <Button variant="primary" className="mt-6" onClick={() => navigate("/projects/new")}>
                <Plus className="h-4 w-4" />
                Create a new project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const st = statusBadge(p.status);
            return (
              <Card
                key={p.id}
                className={cn(
                  "group cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5",
                  isDark ? "hover:border-white/10" : "hover:border-slate-300 hover:shadow-md"
                )}
                onClick={() => openProject(p)}
              >
                <div className="h-28 w-full" style={{ background: `linear-gradient(135deg, ${p.color}33, ${p.color}88)` }}>
                  <div className="flex h-full items-end p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-sm font-bold text-slate-800 shadow">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className={cn("truncate text-[15px] font-semibold", isDark ? "text-white" : "text-slate-900")}>
                        {p.name}
                      </h3>
                      <p className={cn("mt-1 line-clamp-2 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                        {p.description || p.requirementText || "No description yet"}
                      </p>
                    </div>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn("flex items-center gap-1 text-[11px]", isDark ? "text-slate-500" : "text-slate-400")}>
                      <Clock className="h-3 w-3" />
                      {formatRelative(p.updatedAt)}
                    </span>
                    <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(p.id);
                          addToast({ type: "info", title: "Project deleted", message: p.name });
                        }}
                        className={cn(
                          "rounded-lg p-1.5",
                          isDark ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-400"
                        )}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <span className={cn("flex items-center gap-1 text-xs font-medium", isDark ? "text-blue-300" : "text-blue-600")}>
                        Open <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-1 p-2">
            {filtered.map((p) => {
              const st = statusBadge(p.status);
              return (
                <button
                  key={p.id}
                  onClick={() => openProject(p)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition-colors",
                    isDark ? "hover:bg-white/[0.04]" : "hover:bg-slate-50"
                  )}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn("truncate text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>
                        {p.name}
                      </p>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                    <p className={cn("truncate text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                      {p.description || p.requirementText || "No description yet"}
                    </p>
                  </div>
                  <span className={cn("hidden text-xs sm:inline", isDark ? "text-slate-500" : "text-slate-400")}>
                    {p.progress}%
                  </span>
                  <span className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                    {formatRelative(p.updatedAt)}
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
