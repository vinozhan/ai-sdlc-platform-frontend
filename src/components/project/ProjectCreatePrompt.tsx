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
import { cn } from "@/utils/cn";

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

      <div
        className={cn(
          "mx-auto mt-8 w-full max-w-2xl rounded-2xl border border-transparent p-4 shadow-lg transition-all focus-within:shadow-xl",
          isDark
            ? "bg-[#0f1d32]/90 shadow-black/30 focus-within:border-blue-500/40"
            : "bg-white shadow-slate-200/50 focus-within:border-blue-400"
        )}
      >
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
          className={cn(
            "w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-slate-400",
            isDark ? "text-slate-100" : "text-slate-800"
          )}
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
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
      </div>

      <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2.5">
        {starters.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              type="button"
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
          type="button"
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
              type="button"
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
    </>
  );
}
