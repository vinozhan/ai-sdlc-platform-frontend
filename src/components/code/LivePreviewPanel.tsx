import { ExternalLink, GitBranch } from "lucide-react";
import { cn } from "@/utils/cn";
import { useStore } from "@/store/useStore";

type PreviewStatus = "synced" | "building" | "outOfSync";

const statusConfig: Record<PreviewStatus, { label: string; color: string }> = {
  synced: { label: "Synced", color: "#22c55e" },
  building: { label: "Building", color: "#f59e0b" },
  outOfSync: { label: "Out of sync", color: "#ef4444" },
};

export function LivePreviewPanel({
  previewUrl = "ai-sdlc-platform-frontend-preview.local",
  status = "synced",
  generatedAgo = "2m ago",
  generatedBy = "AI Agent",
  sourceDoc = "payment-gateway-srs.pdf",
  versionId = "gen-a3f8c2",
  changedFiles = 3,
}: {
  previewUrl?: string;
  status?: PreviewStatus;
  generatedAgo?: string;
  generatedBy?: string;
  sourceDoc?: string;
  versionId?: string;
  changedFiles?: number;
}) {
  const { theme, settings } = useStore();
  const isDark = theme === "dark";
  const statusInfo = statusConfig[status];
  const initials = generatedBy
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn("flex h-full flex-col overflow-hidden rounded-xl border", isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white")}>
      <div className={cn("border-b px-4 py-3", isDark ? "border-white/10" : "border-slate-100")}>
        <h3 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>Live Preview</h3>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Preview link */}
        <div>
          <p className={cn("mb-1.5 text-[10px] font-semibold uppercase tracking-wider", isDark ? "text-slate-500" : "text-slate-400")}>
            Preview Link
          </p>
          <a
            href={`https://${previewUrl}`}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 font-mono text-xs transition-colors",
              isDark
                ? "border-blue-500/40 bg-blue-500/5 text-blue-300 hover:bg-blue-500/10"
                : "border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-50"
            )}
          >
            <span className="truncate">{previewUrl}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
        </div>

        {/* Status + Generated */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className={cn("mb-1.5 text-[10px] font-semibold uppercase tracking-wider", isDark ? "text-slate-500" : "text-slate-400")}>
              Status
            </p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusInfo.color }} />
              <span className={cn("text-sm font-medium", isDark ? "text-slate-200" : "text-slate-800")}>{statusInfo.label}</span>
            </div>
          </div>
          <div>
            <p className={cn("mb-1.5 text-[10px] font-semibold uppercase tracking-wider", isDark ? "text-slate-500" : "text-slate-400")}>
              Generated
            </p>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-[9px] font-bold text-white">
                {initials}
              </div>
              <span className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-700")}>
                {generatedAgo} by {generatedBy === "AI Agent" ? "AI Agent" : settings.profile.name.split(" ")[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Source */}
        <div>
          <p className={cn("mb-1.5 text-[10px] font-semibold uppercase tracking-wider", isDark ? "text-slate-500" : "text-slate-400")}>
            Source
          </p>
          <div className={cn("space-y-1 text-sm", isDark ? "text-slate-300" : "text-slate-700")}>
            <div className="flex items-center gap-2">
              <GitBranch className={cn("h-3.5 w-3.5", isDark ? "text-slate-500" : "text-slate-400")} />
              <span className="truncate">{sourceDoc}</span>
            </div>
            <p className={cn("font-mono text-xs", isDark ? "text-slate-500" : "text-slate-500")}>
              {versionId} · changes: {changedFiles}
            </p>
          </div>
        </div>

        {/* Rendered preview */}
        <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 dark:border-white/10 dark:bg-slate-900/40">
          <div className="mb-3 rounded bg-slate-700 px-3 py-2 text-center text-xs font-medium text-white">
            Payment Form
          </div>
          <div className="space-y-2">
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs text-slate-700"
              placeholder="Card number"
              defaultValue="4242 4242 4242 4242"
              readOnly
            />
            <div className="flex gap-2">
              <input className="w-1/2 rounded border border-slate-300 px-2 py-1.5 text-xs text-slate-700" placeholder="MM/YY" readOnly />
              <input className="w-1/2 rounded border border-slate-300 px-2 py-1.5 text-xs text-slate-700" placeholder="CVC" readOnly />
            </div>
            <button type="button" className="w-full rounded bg-blue-600 py-2 text-xs font-medium text-white">
              Pay $149.99
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-500">Click wireframe element to map code</p>
      </div>
    </div>
  );
}
