import { useState } from "react";
import {
  Plus,
  ArrowUp,
  Mic,
  Paperclip,
  Monitor,
  Smartphone,
  Layers,
  FileText,
  Sparkles,
  RefreshCw,
  GitBranch,
} from "lucide-react";
import {
  ComposerShell,
  IconGhostButton,
  SoftChipButton,
  StarterChipButton,
  composerTextareaClass,
  surface,
} from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import { nexusLogo } from "@/assets/img";

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

export function ProjectCreatePrompt({
  firstName,
  isDark,
  onSubmit,
  autoFocus = false,
}: {
  firstName: string;
  isDark: boolean;
  onSubmit: (text: string) => void;
  autoFocus?: boolean;
}) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    const text = prompt.trim();
    if (!text) return;
    onSubmit(text);
  };

  return (
    <>
      <div className="mx-auto max-w-2xl text-center">
        <div
          className={cn(
            "mb-4 inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium sm:mb-5 sm:text-xs",
            isDark ? "border-white/10 bg-white/[0.04] text-slate-300" : "border-slate-200 bg-white text-slate-600 shadow-sm"
          )}
        >
          <img src={nexusLogo} alt="" className="h-4 w-4 shrink-0 object-cover object-left" />
          <span className="truncate">
            <span className="sm:hidden">AI-assisted SDLC</span>
            <span className="hidden sm:inline">AI-assisted SDLC from requirements to release</span>
          </span>
        </div>
        <h1 className={cn("text-[1.65rem] font-semibold leading-tight tracking-tight sm:text-3xl md:text-4xl", surface.heading(isDark))}>
          Hi {firstName}, what do you want to build?
        </h1>
        <p className={cn("mx-auto mt-3 max-w-md text-sm md:text-base", surface.muted(isDark))}>
          Describe a product or paste requirements. We’ll generate design, code, tests, and deployment plans.
        </p>
      </div>

      <ComposerShell isDark={isDark} className="mx-auto mt-6 max-w-2xl sm:mt-8">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          rows={3}
          autoFocus={autoFocus}
          placeholder="Describe a product, paste requirements, or outline a system to build..."
          className={composerTextareaClass(isDark)}
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <IconGhostButton isDark={isDark} title="More options">
              <Plus className="h-4 w-4" />
            </IconGhostButton>
            <IconGhostButton isDark={isDark} title="Attach SRS">
              <Paperclip className="h-4 w-4" />
            </IconGhostButton>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium transition-colors sm:px-3",
                isDark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden xs:inline sm:inline">Plan</span>
            </button>
            <IconGhostButton isDark={isDark}>
              <Mic className="h-4 w-4" />
            </IconGhostButton>
            <button
              type="button"
              onClick={handleSubmit}
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
      </ComposerShell>

      <div className="mx-auto mt-5 max-w-2xl sm:mt-6">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none sm:flex-wrap sm:justify-center sm:overflow-visible">
          {starters.map((s) => {
            const Icon = s.icon;
            return (
              <StarterChipButton key={s.label} isDark={isDark} onClick={() => setPrompt(`Build a ${s.label.toLowerCase()} for `)}>
                <Icon className="h-3.5 w-3.5 opacity-70" />
                {s.label}
              </StarterChipButton>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-4 flex max-w-2xl flex-col items-center gap-2.5 sm:mt-5">
        <button
          type="button"
          className={cn("flex items-center gap-1.5 text-xs", isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600")}
          onClick={() => setPrompt(examples[Math.floor(Math.random() * examples.length)])}
        >
          Try an example prompt <RefreshCw className="h-3 w-3" />
        </button>
        <div className="-mx-1 flex w-full gap-2 overflow-x-auto px-1 pb-1 scrollbar-none sm:flex-wrap sm:justify-center sm:overflow-visible">
          {examples.map((ex) => (
            <SoftChipButton key={ex} isDark={isDark} onClick={() => setPrompt(ex)}>
              {ex}
            </SoftChipButton>
          ))}
        </div>
      </div>
    </>
  );
}
