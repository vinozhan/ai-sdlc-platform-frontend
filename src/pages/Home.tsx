import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FolderKanban,
  ArrowUp,
  ArrowRight,
  Mic,
  Paperclip,
  Monitor,
  Smartphone,
  Layers,
  FileText,
  Sparkles,
  RefreshCw,
  Settings,
  GitBranch,
  Clock,
  CheckCircle2,
  Loader2,
  Rocket,
  Code2,
  FlaskConical,
  Pencil,
} from "lucide-react";
import { useStore, type Project } from "@/store/useStore";
import { cn } from "@/utils/cn";
import { Badge, Button, Card, CardContent } from "@/components/ui/primitives";

const examples = [
  "Payment gateway with KYC verification",
  "Inventory management API",
  "Real-time notification service",
];

const starters = [
  { icon: Monitor, label: "Web app" },
  { icon: Smartphone, label: "Mobile API" },
  { icon: Layers, label: "Microservices" },
  { icon: FileText, label: "From SRS" },
  { icon: GitBranch, label: "From repo" },
];

function statusMeta(status: Project["status"]) {
  switch (status) {
    case "draft":
      return { label: "Draft", variant: "default" as const, icon: Pencil };
    case "analyzing":
      return { label: "Analyzing", variant: "info" as const, icon: Loader2 };
    case "design":
      return { label: "Design", variant: "c1" as const, icon: Pencil };
    case "code":
      return { label: "Code", variant: "c2" as const, icon: Code2 };
    case "testing":
      return { label: "Testing", variant: "c3" as const, icon: FlaskConical };
    case "deploy":
      return { label: "Deploy", variant: "c4" as const, icon: Rocket };
    case "complete":
      return { label: "Complete", variant: "success" as const, icon: CheckCircle2 };
    default:
      return { label: status, variant: "default" as const, icon: FolderKanban };
  }
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function stageColors(progress: number) {
  const filled = Math.max(1, Math.min(4, Math.ceil(progress / 25)));
  return Array.from({ length: 4 }, (_, i) => {
    if (i < filled - 1) return "#22c55e";
    if (i === filled - 1) return progress >= 100 ? "#22c55e" : "#2563eb";
    return undefined;
  });
}

export function Home() {
  const navigate = useNavigate();
  const { theme, settings, projects, createProject, startRequirementsPipeline, setActiveProjectId, addToast } =
    useStore();
  const isDark = theme === "dark";
  const [prompt, setPrompt] = useState("");
  const firstName = settings.profile.name.split(" ")[0] || "there";
  const featured = projects.slice(0, 3);

  const handleCreate = () => {
    const text = prompt.trim();
    if (!text) {
      navigate("/projects/new");
      return;
    }
    const name = text.length > 48 ? `${text.slice(0, 48)}…` : text;
    const project = createProject(name, text);
    startRequirementsPipeline(project.id, text);
    addToast({ type: "success", title: "Project created", message: name });
    navigate(`/projects/${project.id}/requirements`);
  };

  const openProject = (p: Project) => {
    setActiveProjectId(p.id);
    navigate(`/projects/${p.id}/requirements`);
  };

  return (
    <div className="relative w-full px-6 pb-12 pt-10 md:px-8 md:pt-14">
        {/* Hero */}
        <div className="mx-auto max-w-2xl text-center">
          <div
            className={cn(
              "mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
              isDark ? "border-white/10 bg-white/[0.04] text-slate-300" : "border-slate-200 bg-white text-slate-600 shadow-sm"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            AI-assisted SDLC from requirements to release
          </div>
          <h1
            className={cn(
              "text-3xl font-semibold tracking-tight md:text-4xl",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            Hi {firstName}, what do you want to build?
          </h1>
          <p className={cn("mt-3 text-sm md:text-base", isDark ? "text-slate-400" : "text-slate-500")}>
            Describe a product or paste requirements. We’ll generate design, code, tests, and deployment plans.
          </p>
        </div>

        {/* Prompt box */}
        <div
          className={cn(
            "mx-auto mt-8 w-full max-w-2xl rounded-2xl border p-4 shadow-lg transition-all focus-within:shadow-xl",
            isDark
              ? "border-white/10 bg-[#0f1d32]/90 shadow-black/30 focus-within:border-blue-500/40"
              : "border-slate-200/80 bg-white shadow-slate-200/50 focus-within:border-blue-400"
          )}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleCreate();
              }
            }}
            rows={3}
            placeholder="Describe a product, paste requirements, or outline a system to build..."
            className={cn(
              "w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-slate-400",
              isDark ? "text-slate-100" : "text-slate-800"
            )}
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigate("/projects/new")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                  isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"
                )}
                title="More options"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                  isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"
                )}
                title="Attach SRS"
              >
                <Paperclip className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium transition-colors",
                  isDark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Plan
              </button>
              <button
                type="button"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                  isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"
                )}
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl text-white transition-all",
                  prompt.trim()
                    ? "bg-blue-500 shadow-md shadow-blue-500/25 hover:bg-blue-400"
                    : isDark
                    ? "bg-white/10 text-slate-500"
                    : "bg-slate-200 text-slate-400"
                )}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Starters */}
        <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2.5">
          {starters.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.label}
                onClick={() => setPrompt(`Build a ${s.label.toLowerCase()} for `)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-all hover:-translate-y-0.5",
                  isDark
                    ? "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                    : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300"
                )}
              >
                <Icon className="h-3.5 w-3.5 opacity-70" />
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-5 flex max-w-2xl flex-col items-center gap-2.5">
          <button
            className={cn(
              "flex items-center gap-1.5 text-xs",
              isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
            )}
            onClick={() => setPrompt(examples[Math.floor(Math.random() * examples.length)])}
          >
            Try an example prompt <RefreshCw className="h-3 w-3" />
          </button>
          <div className="flex flex-wrap justify-center gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  isDark
                    ? "border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    : "border-slate-200 bg-white/80 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                )}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Active projects */}
        <div className="mt-14">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className={cn("text-lg font-semibold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
                Your projects
              </h2>
              <p className={cn("mt-0.5 text-sm", isDark ? "text-slate-500" : "text-slate-400")}>
                Continue a run or start something new
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/projects")}>
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {featured.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-14 text-center">
                <FolderKanban className={cn("mb-3 h-8 w-8", isDark ? "text-slate-600" : "text-slate-300")} />
                <p className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-slate-700")}>No projects yet</p>
                <p className={cn("mt-1 text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                  Create your first project to start the SDLC pipeline
                </p>
                <Button variant="primary" size="sm" className="mt-4" onClick={() => navigate("/projects/new")}>
                  <Plus className="h-3.5 w-3.5" />
                  New project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {featured.map((p) => {
                const st = statusMeta(p.status);
                const stages = stageColors(p.progress);
                return (
                  <Card
                    key={p.id}
                    className={cn(
                      "group cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5",
                      isDark ? "hover:border-white/15" : "hover:border-slate-300 hover:shadow-md"
                    )}
                    onClick={() => openProject(p)}
                  >
                    <div
                      className="relative h-24"
                      style={{
                        background: `linear-gradient(135deg, ${p.color}22 0%, ${p.color}55 50%, ${p.color}33 100%)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
                      <div className="absolute bottom-3 left-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-sm font-bold text-slate-800 shadow-sm">
                        {p.name.charAt(0)}
                      </div>
                    </div>
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className={cn("truncate text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>
                            {p.name}
                          </h3>
                          <p className={cn("mt-0.5 line-clamp-2 text-xs leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>
                            {p.description}
                          </p>
                        </div>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </div>

                      <div className="flex gap-1">
                        {stages.map((color, i) => (
                          <div
                            key={i}
                            className={cn("h-1.5 flex-1 rounded-full", !color && (isDark ? "bg-white/10" : "bg-slate-100"))}
                            style={color ? { backgroundColor: color } : undefined}
                          />
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {p.techStack.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className={cn(
                              "rounded-md border px-1.5 py-0.5 text-[10px]",
                              isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"
                            )}
                          >
                            {t}
                          </span>
                        ))}
                        <span className={cn("ml-auto flex items-center gap-1 text-[11px]", isDark ? "text-slate-500" : "text-slate-400")}>
                          <Clock className="h-3 w-3" />
                          {formatRelative(p.updatedAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="mt-8 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/projects")}>
            <FolderKanban className="h-3.5 w-3.5" />
            All projects ({projects.length})
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
            <Settings className="h-3.5 w-3.5" />
            Settings
          </Button>
        </div>
    </div>
  );
}
