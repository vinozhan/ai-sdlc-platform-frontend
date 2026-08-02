import { useEffect, useState } from "react";
import { X, Send } from "lucide-react";
import { surface } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import type { WireframeFlow } from "../fixtures/wireframeFlows";
import { ScreenPreview } from "./wireframes/ScreenPreview";

export function WireframeMockupModal({
  flow,
  version,
  isOpen,
  isDark,
  onClose,
  onApprove,
  onRequestRefinement,
}: {
  flow: WireframeFlow;
  version: string;
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onApprove: () => void;
  onRequestRefinement: (feedback: string) => void;
}) {
  const [screenIndex, setScreenIndex] = useState(0);
  const [showLinks, setShowLinks] = useState(false);
  const [refinementMode, setRefinementMode] = useState(false);
  const [feedback, setFeedback] = useState("");

  const screen = flow.screens[screenIndex];

  useEffect(() => {
    if (isOpen) {
      setScreenIndex(0);
      setShowLinks(false);
      setRefinementMode(false);
      setFeedback("");
    }
  }, [isOpen, flow.id]);

  const navigateTo = (targetId: string) => {
    const idx = flow.screens.findIndex((s) => s.id === targetId);
    if (idx >= 0) setScreenIndex(idx);
  };

  const handleSendRefinement = () => {
    const text = feedback.trim();
    if (!text) return;
    onRequestRefinement(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-label="Close modal" />

      <div
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full max-w-[800px] flex-col overflow-hidden rounded-2xl shadow-2xl",
          surface.modal(isDark)
        )}
      >
        {/* Header */}
        <div className={cn("border-b px-6 py-4", surface.divider(isDark))}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className={cn("text-lg font-semibold", surface.heading(isDark))}>
                Click through the flow
              </h2>
              <p className={cn("mt-1 text-sm", surface.muted(isDark))}>
                Anything outlined is clickable, exactly like the real app will be.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <label className={cn("flex items-center gap-2 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                <input
                  type="checkbox"
                  checked={showLinks}
                  onChange={(e) => setShowLinks(e.target.checked)}
                  className="rounded border-slate-300 accent-blue-600"
                />
                Show links
              </label>
              <button
                type="button"
                onClick={onClose}
                className={cn("rounded-lg p-1.5 transition-colors", isDark ? "hover:bg-white/10" : "hover:bg-slate-100")}
              >
                <X className={cn("h-5 w-5", isDark ? "text-slate-400" : "text-slate-500")} />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {refinementMode ? (
            <div className="space-y-4">
              <p className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-600")}>
                Describe what should change about the <strong>{flow.wireframeKey}</strong> flow:
              </p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                placeholder="Describe what should change about this flow..."
                className={cn(
                  "w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/30",
                  isDark ? "border-white/10 bg-white/[0.04] text-slate-200 placeholder:text-slate-500" : "border-slate-200 bg-white text-slate-800"
                )}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSendRefinement}
                  disabled={!feedback.trim()}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => setRefinementMode(false)}
                  className={cn("rounded-lg border px-4 py-2 text-sm", isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-600")}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={cn("rounded-xl border", isDark ? "border-white/10" : "border-slate-200")}>
              <div className={cn("border-b px-4 py-3", isDark ? "border-white/10" : "border-slate-100")}>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>{screen.name}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-50 text-blue-700")}>
                    {version}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  {screen.breadcrumb.map((crumb, i) => (
                    <span key={crumb} className="flex items-center gap-1.5">
                      {i > 0 && <span className={cn("text-[10px]", isDark ? "text-slate-600" : "text-slate-300")}>›</span>}
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", isDark ? "bg-white/[0.06] text-slate-400" : "bg-slate-100 text-slate-600")}>
                        {crumb}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <ScreenPreview screen={screen} showLinks={showLinks} onNavigate={navigateTo} isDark={isDark} />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!refinementMode && (
          <div className={cn("flex gap-3 border-t px-6 py-3", isDark ? "border-white/10" : "border-slate-100")}>
            <button
              type="button"
              onClick={onApprove}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Approve Design
            </button>
            <button
              type="button"
              onClick={() => setRefinementMode(true)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-semibold",
                isDark ? "border-blue-500/40 text-blue-300 hover:bg-blue-500/10" : "border-blue-200 text-blue-700 hover:bg-blue-50"
              )}
            >
              Request Refinements
            </button>
          </div>
        )}

        {/* Step indicator */}
        {!refinementMode && (
          <div className={cn("flex items-center justify-between border-t px-6 py-3", isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-100 bg-slate-50/50")}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {flow.screens.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScreenIndex(i)}
                    className={cn(
                      "rounded-full transition-all",
                      i === screenIndex ? "h-2.5 w-2.5 bg-blue-600" : "h-2 w-2 bg-slate-300 dark:bg-slate-600"
                    )}
                    aria-label={s.name}
                  />
                ))}
              </div>
              <span className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-slate-700")}>{screen.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setScreenIndex(0)}
              className={cn("text-xs font-medium text-blue-600 hover:underline dark:text-blue-400")}
            >
              Restart flow
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
