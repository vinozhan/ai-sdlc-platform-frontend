import { useRef, useState } from "react";
import { ArrowUp, FileText, Mic, Paperclip, Upload } from "lucide-react";
import type { Project } from "@/types/project";
import { useUiStore } from "@/store/ui";
import {
  ComposerShell,
  IconGhostButton,
  SoftChipButton,
  composerTextareaClass,
  surface,
} from "@/shared/ui";
import { cn } from "@/shared/utils/cn";

export function RequirementsInput({
  project,
  onSubmit,
}: {
  project: Project;
  onSubmit: (text: string, files: string[]) => void;
}) {
  const theme = useUiStore((s) => s.theme);
  const isDark = theme === "dark";
  const [text, setText] = useState(project.requirementText);
  const [files, setFiles] = useState<string[]>(project.files);
  const fileRef = useRef<HTMLInputElement>(null);

  const examples = [
    "Build a digital banking platform with payments, KYC, and transaction history.",
    "Create an inventory API with stock levels, suppliers, and low-stock alerts.",
    "Design a notification service supporting email, SMS, and push channels.",
  ];

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <div
          className={cn(
            "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl",
            isDark ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-600"
          )}
        >
          <FileText className="h-6 w-6" />
        </div>
        <h3 className={cn("text-2xl font-semibold tracking-tight", surface.heading(isDark))}>
          What should {project.name} do?
        </h3>
        <p className={cn("mt-2 text-sm", surface.muted(isDark))}>
          Paste natural language requirements, user stories, or upload an SRS. We’ll generate design artifacts automatically.
        </p>
      </div>

      <ComposerShell isDark={isDark} variant="accent">
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && text.trim()) {
              onSubmit(text.trim(), files);
            }
          }}
          rows={5}
          placeholder="Describe features, actors, constraints, integrations..."
          className={composerTextareaClass(isDark)}
        />

        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map((f) => (
              <span
                key={f}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs",
                  surface.border(isDark),
                  surface.body(isDark)
                )}
              >
                <Upload className="h-3 w-3" />
                {f}
                <button
                  onClick={() => setFiles((prev) => prev.filter((x) => x !== f))}
                  className="ml-1 opacity-60 hover:opacity-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={(e) => {
                const names = Array.from(e.target.files || []).map((f) => f.name);
                if (names.length) setFiles((prev) => [...prev, ...names]);
              }}
            />
            <IconGhostButton isDark={isDark} title="Attach SRS documents" onClick={() => fileRef.current?.click()}>
              <Paperclip className="h-4 w-4" />
            </IconGhostButton>
            <IconGhostButton isDark={isDark}>
              <Mic className="h-4 w-4" />
            </IconGhostButton>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("hidden text-[11px] sm:inline", surface.faint(isDark))}>⌘ + Enter</span>
            <button
              type="button"
              disabled={!text.trim()}
              onClick={() => text.trim() && onSubmit(text.trim(), files)}
              className={cn(
                "flex h-9 items-center gap-2 rounded-xl px-4 text-sm font-medium text-white transition-colors disabled:opacity-40",
                "bg-blue-500 hover:bg-blue-400"
              )}
            >
              Analyze
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </ComposerShell>

      <div
        className={cn("mt-4 w-full rounded-xl border border-dashed p-4 text-center text-xs", surface.dashed(isDark))}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const names = Array.from(e.dataTransfer.files).map((f) => f.name);
          if (names.length) setFiles((prev) => [...prev, ...names]);
        }}
      >
        Drop SRS / PDF / DOCX here, or use the paperclip to attach
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {examples.map((ex) => (
          <SoftChipButton key={ex} isDark={isDark} className="max-w-xs text-left" onClick={() => setText(ex)}>
            {ex}
          </SoftChipButton>
        ))}
      </div>
    </div>
  );
}
