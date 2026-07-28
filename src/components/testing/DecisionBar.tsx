import { useState } from "react";
import { ArrowRight, MessageSquare } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/primitives";
import { useStore } from "@/store/useStore";
import type { TestingView } from "@/components/testing/view";

/**
 * The phase decision. It appears when the phase is waiting on a human, spans
 * the bottom, and never blocks navigation - every step stays reachable behind
 * it. Built from the app's card surface and buttons; the only motion is the
 * amber dot that marks "waiting on you".
 */
export function DecisionBar({
  view,
  onApprove,
  onRequestChanges,
}: {
  view: TestingView;
  onApprove: () => void;
  onRequestChanges: (note: string) => void;
}) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  const [composing, setComposing] = useState(false);
  const [note, setNote] = useState("");

  const outstanding = [
    view.inbox.awaiting > 0 ? `${view.inbox.awaiting} repairs awaiting you` : null,
    view.inbox.regressions > 0 ? `${view.inbox.regressions} regressions with the developers` : null,
    view.findingCounts.toResolve > 0 ? `${view.findingCounts.toResolve} findings to resolve` : null,
  ].filter(Boolean) as string[];

  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-6 border-t backdrop-blur-xl md:-mx-8",
        isDark ? "border-white/[0.06] bg-[#0a1628]/95" : "border-slate-200/80 bg-white/95"
      )}
    >
      {composing && (
        <div className={cn("border-b px-6 py-3 md:px-8", isDark ? "border-white/[0.06]" : "border-slate-100")}>
          <label className="tp-label block" htmlFor="phase-note">
            What needs to change before this can ship
          </label>
          <textarea
            id="phase-note"
            autoFocus
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="The KYC regression has to be fixed before Deployment starts."
            className={cn(
              "mt-2 w-full resize-none rounded-xl border bg-transparent px-3 py-2 text-[13px] outline-none focus:border-blue-500/50",
              isDark
                ? "border-white/10 text-slate-100 placeholder:text-slate-600"
                : "border-slate-200 text-slate-800 placeholder:text-slate-400"
            )}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="primary"
              disabled={!note.trim()}
              onClick={() => {
                onRequestChanges(note.trim());
                setNote("");
                setComposing(false);
              }}
            >
              Send the note
            </Button>
            <Button size="sm" variant="outline" onClick={() => setComposing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 px-6 py-3 md:flex-row md:items-center md:px-8">
        <span className="relative mt-1 flex h-2 w-2 shrink-0 md:mt-0">
          <span className="tp-pending-edge absolute inline-flex h-full w-full rounded-full bg-amber-400" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>

        <div className="min-w-0 flex-1">
          <p className={cn("text-[13px] font-semibold", isDark ? "text-white" : "text-slate-900")}>
            {view.superseded
              ? `Build ${view.build} arrived after your approval - this phase is waiting on you again`
              : "This phase is waiting on you"}
          </p>
          <p className="tp-den mt-0.5 truncate">
            {view.superseded
              ? `${view.superseded.kind === "approved" ? "Approved" : "Changes requested"} for Build ${view.superseded.build} by ${view.superseded.by} · `
              : `Build ${view.build} · `}
            {outstanding.length > 0 ? outstanding.join(" · ") : "nothing outstanding, every proof passed"}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            className={cn("flex-1 md:flex-none", composing && (isDark ? "bg-white/5" : "bg-slate-100"))}
            onClick={() => setComposing((v) => !v)}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Request changes
          </Button>
          <Button variant="primary" className="flex-1 md:flex-none" onClick={onApprove}>
            Approve and start Deployment
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
