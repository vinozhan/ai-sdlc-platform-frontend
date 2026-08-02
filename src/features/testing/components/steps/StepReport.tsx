import { useState } from "react";
import { ArrowUpRight, Check, GitBranch, History, MessageSquare, RotateCcw } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/ui/primitives";
import { Note, Panel } from "../bits";
import type { DecisionChainStep, TestingRun } from "../../fixtures/types";
import type { StepId, TestingView } from "../../model/view";
import { ReportAuditTable } from "./report/ReportAuditTable";
import { ReportDecisionChain } from "./report/ReportDecisionChain";
import { ReportSummaryGrid } from "./report/ReportSummaryGrid";

export function StepReport({
  view,
  run,
  decisionChain,
  onGoTo,
  onOpenDeployment,
  onRollback,
}: {
  view: TestingView;
  run: TestingRun;
  decisionChain: DecisionChainStep[];
  onGoTo: (step: StepId) => void;
  onOpenDeployment: () => void;
  onRollback: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const last = run.lastVerified;

  return (
    <div className="space-y-4">
      {view.superseded && (
        <section className="overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <div className="flex flex-wrap items-start gap-3 px-4 py-3.5">
            <History className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold">
                Build {view.build} superseded the decision on Build {view.superseded.build}
              </p>
              <Note className="mt-1">
                {view.superseded.by}{" "}
                {view.superseded.kind === "approved" ? "approved" : "requested changes on"} Build{" "}
                {view.superseded.build} at {view.superseded.at.slice(11)}. That decision covered that build only, so this
                phase is waiting on a decision again. The earlier one stays in the audit log.
              </Note>
            </div>
          </div>
        </section>
      )}

      {view.decision && (
        <section
          className={cn(
            "overflow-hidden rounded-2xl border",
            view.decision.kind === "approved"
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-amber-500/30 bg-amber-500/5"
          )}
        >
          <div className="flex flex-wrap items-start gap-3 px-4 py-3.5">
            {view.decision.kind === "approved" ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold">
                {view.decision.kind === "approved"
                  ? `Approved for Build ${view.decision.build} by ${view.decision.by} at ${view.decision.at.slice(11)} · Deployment started`
                  : `Changes requested by ${view.decision.by} at ${view.decision.at.slice(11)}`}
              </p>
              {view.decision.note && <Note className="mt-1">“{view.decision.note}”</Note>}
              {view.decision.kind === "approved" && (
                <button
                  type="button"
                  onClick={onOpenDeployment}
                  className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-blue-600 underline underline-offset-2 dark:text-blue-400"
                >
                  Open Deployment
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <ReportSummaryGrid view={view} runSprint={run.sprint} runBranch={run.branch} onGoTo={onGoTo} />
      <ReportDecisionChain decisionChain={decisionChain} />
      <ReportAuditTable view={view} />

      <Panel
        icon={<GitBranch className="h-4 w-4 text-blue-400" />}
        label="Rollback"
        title="Return to the last verified build"
        meta="Only if this build should not ship at all"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[12.5px]">
              {last.sprint} · Build {last.build}
            </p>
            <Note className="mt-1 text-[12.5px]">
              Verified {last.at} - {last.note}. Everything from Build {view.build} stays in the branch history.
            </Note>
          </div>
          {!confirming ? (
            <Button variant="outline" onClick={() => setConfirming(true)}>
              <RotateCcw className="h-3.5 w-3.5" />
              Roll back…
            </Button>
          ) : (
            <div className="w-full rounded-lg border border-red-500/30 bg-red-500/5 px-3.5 py-3">
              <p className="text-[13px] font-semibold">
                Return the deployable build to {last.sprint} · Build {last.build}?
              </p>
              <Note className="mt-1 text-[12.5px]">
                That build ran {last.note}. Build {view.build} stops being the candidate for Deployment, and this
                rollback is written to the audit log.
              </Note>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <Button
                  variant="error"
                  size="sm"
                  onClick={() => {
                    onRollback();
                    setConfirming(false);
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Return to Build {last.build}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
