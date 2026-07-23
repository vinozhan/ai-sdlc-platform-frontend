import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FolderPlus, Sparkles } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/utils/cn";
import { Button, Card, CardContent } from "@/components/ui/primitives";

export function NewProject() {
  const navigate = useNavigate();
  const { theme, createProject, addToast } = useStore();
  const isDark = theme === "dark";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const canContinue = name.trim().length >= 2;

  const handleNext = () => {
    if (!canContinue) return;
    const project = createProject(name, description);
    addToast({ type: "success", title: "Project created", message: project.name });
    navigate(`/projects/${project.id}/requirements`);
  };

  return (
    <div className="flex min-h-full w-full flex-col justify-center px-6 py-12">
      <button
        onClick={() => navigate(-1)}
        className={cn(
          "mb-6 inline-flex items-center gap-1.5 text-sm",
          isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"
        )}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mb-8">
        <div
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl",
            isDark ? "bg-violet-500/15 text-violet-300" : "bg-violet-50 text-violet-600"
          )}
        >
          <FolderPlus className="h-6 w-6" />
        </div>
        <h1 className={cn("text-2xl font-semibold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
          Create a new project
        </h1>
        <p className={cn("mt-2 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
          Give your project a name. Next you’ll enter requirements and the AI pipeline will run automatically.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <label className={cn("mb-1.5 block text-xs font-semibold uppercase tracking-wide", isDark ? "text-slate-400" : "text-slate-500")}>
              Project name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canContinue) handleNext();
              }}
              placeholder="e.g. PayFlow Checkout Service"
              className={cn(
                "h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-violet-500/30",
                isDark
                  ? "border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                  : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
              )}
            />
          </div>

          <div>
            <label className={cn("mb-1.5 block text-xs font-semibold uppercase tracking-wide", isDark ? "text-slate-400" : "text-slate-500")}>
              Description <span className="font-normal normal-case opacity-70">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short summary of what this project should deliver"
              className={cn(
                "w-full resize-none rounded-xl border px-3.5 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-violet-500/30",
                isDark
                  ? "border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                  : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
              )}
            />
          </div>

          <div
            className={cn(
              "flex items-start gap-3 rounded-xl border p-3",
              isDark ? "border-violet-500/20 bg-violet-500/5" : "border-violet-100 bg-violet-50"
            )}
          >
            <Sparkles className={cn("mt-0.5 h-4 w-4 shrink-0", isDark ? "text-violet-300" : "text-violet-600")} />
            <p className={cn("text-xs leading-relaxed", isDark ? "text-slate-300" : "text-slate-600")}>
              After you continue, you’ll land on <strong>Requirements</strong>. Paste natural language, user stories, or
              SRS content — the design phases will run automatically.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={() => navigate("/projects")}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!canContinue} onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
