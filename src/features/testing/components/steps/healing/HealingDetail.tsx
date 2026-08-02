import { ArrowLeft, ArrowUpRight, Bug, Check, ShieldAlert, Wrench, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Badge, Button } from "@/shared/ui/primitives";
import { Note, Panel, StateChip, TriageChip } from "../../bits";
import { RepairProof } from "../../RepairProof";
import { fileName, type ViewFailure } from "../../../model/view";

export function HealingDetail({
  failure,
  showDetail,
  onBack,
  onApprove,
  onReject,
  onOpenFile,
}: {
  failure: ViewFailure;
  showDetail: boolean;
  onBack: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onOpenFile: (path: string, line: number, label: string) => void;
}) {
  const guardBlocked = failure.state === "blocked";
  const decidable = failure.state === "awaiting-approval" && Boolean(failure.repair);

  return (
    <div className={cn("min-w-0 space-y-3", !showDetail && "hidden lg:block")}>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 lg:hidden dark:text-blue-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to the inbox
      </button>
      <Panel
        icon={<Wrench className="h-4 w-4 text-blue-400" />}
        label={`Failure · ${failure.moduleId}`}
        title={<span className="break-all font-mono text-[12px]">{failure.test}</span>}
        meta={`${failure.reason} · protects ${failure.requirement.id} · ${failure.runner} · ${failure.at}`}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <TriageChip failure={failure} />
            <StateChip failure={failure} />
          </div>
        }
      >
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => onOpenFile(failure.file, failure.line, failure.reason)}
            className="group inline-flex flex-wrap items-center gap-1.5 font-mono text-[11.5px] text-blue-600 dark:text-blue-400"
          >
            <span className="underline underline-offset-2 group-hover:decoration-2">
              {fileName(failure.file)}:{failure.line}
            </span>
            <ArrowUpRight className="h-3 w-3" />
            <span className="tp-den">open the test file at the failing line</span>
          </button>

          {failure.decision && (
            <div
              className={cn(
                "flex items-start gap-2.5 rounded-lg border p-3",
                failure.decision.decision === "approved"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-slate-200 bg-slate-50 dark:border-white/[0.06] dark:bg-white/[0.02]"
              )}
            >
              {failure.decision.decision === "approved" ? (
                <Check className="mt-px h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <X className="mt-px h-4 w-4 shrink-0 text-slate-400" />
              )}
              <p className="text-[13px] leading-snug">
                {failure.decision.decision === "approved" ? "You approved this repair" : "You rejected this repair"} at{" "}
                {failure.decision.at.slice(11)}. It is in the audit log and in the report.
              </p>
            </div>
          )}

          {failure.repair && <RepairProof repair={failure.repair} />}

          {failure.repair && (
            <div>
              <p className="tp-label">Why the test was stale</p>
              <Note className="mt-1.5">{failure.repair.why}</Note>
            </div>
          )}

          {!failure.repair && failure.note && (
            <div>
              <p className="tp-label">{failure.triage === "regression" ? "What broke" : "What happened"}</p>
              <Note className="mt-1.5">{failure.note}</Note>
            </div>
          )}

          {failure.repair && failure.note && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <Note className="text-[12.5px]">{failure.note}</Note>
            </div>
          )}

          {decidable && (
            <div className="flex flex-wrap items-center gap-2 border-t border-[color:var(--tp-line)] pt-4">
              <Button variant="primary" size="sm" onClick={() => onApprove(failure.id)}>
                <Check className="h-3.5 w-3.5" />
                Approve repair
              </Button>
              <Button variant="outline" size="sm" onClick={() => onReject(failure.id)}>
                <X className="h-3.5 w-3.5" />
                Reject
              </Button>
              <p className="tp-den ml-auto">Approving applies the repair on this build and logs the decision.</p>
            </div>
          )}

          {guardBlocked && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
              <ShieldAlert className="mt-px h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
              <p className="text-[13px] leading-snug">
                There is nothing to approve here. The guard rejected this repair, so the failure went to{" "}
                {failure.owner ?? "the module owner"} untouched, with the proposal attached.
              </p>
            </div>
          )}

          {failure.triage === "regression" && (
            <div className="flex flex-wrap items-center gap-2 border-t border-[color:var(--tp-line)] pt-4">
              <Badge variant="error">
                <Bug className="h-3 w-3" />
                With {failure.owner}
              </Badge>
              <p className="tp-den">Real regressions are never repaired automatically. The test stays exactly as written.</p>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
