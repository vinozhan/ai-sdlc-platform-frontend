import { useState } from "react";
import { ArrowUpRight, Check, ClipboardCheck, Download, GitBranch, History, MessageSquare, RotateCcw, ScrollText, Workflow } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button, Td, Th } from "@/components/ui/primitives";
import { ActorMark, Note, Panel } from "@/components/testing/bits";
import { decisionChain, testingRun, type AuditEntry } from "@/data/testingData";
import type { StepId, TestingView } from "@/components/testing/view";

function exportCsv(rows: AuditEntry[], build: number) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [
    "timestamp,actor,action,target,detail",
    ...rows.map((r) => [r.at, r.actor, r.action, r.target, r.detail].map(escape).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `testing-audit-build-${build}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function SummaryCell({
  label,
  value,
  denominator,
  note,
  tone,
  onClick,
  className,
}: {
  label: string;
  value: string | number;
  denominator?: string;
  note?: string;
  tone?: "pass" | "fail" | "caution";
  onClick?: () => void;
  className?: string;
}) {
  const color =
    tone === "pass" ? "var(--tp-pass)" : tone === "fail" ? "var(--tp-fail)" : tone === "caution" ? "var(--tp-caution)" : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group border-b border-r border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:border-white/[0.04] dark:hover:bg-white/[0.02]",
        className
      )}
    >
      <p className="tp-label flex items-center gap-1 truncate">
        {label}
        <ArrowUpRight className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
      </p>
      <p className="mt-1.5 flex items-baseline gap-1.5">
        <span className="tp-num text-2xl" style={color ? { color } : undefined}>
          {value}
        </span>
        {denominator && <span className="tp-den">{denominator}</span>}
      </p>
      {note && <p className="tp-den mt-0.5 truncate">{note}</p>}
    </button>
  );
}

export function StepReport({
  view,
  onGoTo,
  onOpenDeployment,
  onRollback,
}: {
  view: TestingView;
  onGoTo: (step: StepId) => void;
  onOpenDeployment: () => void;
  onRollback: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const last = testingRun.lastVerified;
  const severity = {
    critical: view.findings.filter((f) => f.severity === "critical").length,
    high: view.findings.filter((f) => f.severity === "high").length,
  };

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

      <Panel
        icon={<ClipboardCheck className="h-4 w-4 text-blue-400" />}
        label="Validation summary"
        title={`${testingRun.sprint} · Build ${view.build}`}
        meta={`Suite finished ${view.finishedAt} · ${view.duration} · branch ${testingRun.branch}`}
        bodyClassName="p-0"
      >
        <div className="grid grid-cols-2 border-t border-slate-100 dark:border-white/[0.04] lg:grid-cols-4">
          <SummaryCell
            label="Tests passing"
            value={view.totals.passed}
            denominator={`of ${view.totals.run} run`}
            note={`pass rate ${view.totals.passRate.toFixed(1)}% · ${view.totals.skipped} skipped`}
            onClick={() => onGoTo("tests")}
          />
          <SummaryCell
            label="Failing"
            value={view.totals.failed}
            tone={view.totals.failed > 0 ? "fail" : "pass"}
            note={`${view.inbox.brittle} brittle · ${view.inbox.regressions} real regressions`}
            onClick={() => onGoTo("healing")}
          />
          <SummaryCell
            label="Repairs awaiting you"
            value={view.inbox.awaiting}
            tone={view.inbox.awaiting > 0 ? "caution" : "pass"}
            note={`${view.decisions.approved} approved · ${view.decisions.rejected} rejected`}
            onClick={() => onGoTo("healing")}
          />
          <SummaryCell
            label="Healed"
            value={view.inbox.healed}
            note="repairs verified and merged"
            onClick={() => onGoTo("healing")}
          />
          <SummaryCell
            label="Line coverage"
            value={`${view.quality.line.percent}%`}
            note={`${view.quality.line.covered.toLocaleString()} of ${view.quality.line.total.toLocaleString()} lines`}
            onClick={() => onGoTo("quality")}
          />
          <SummaryCell
            label="Branch coverage"
            value={`${view.quality.branch.percent}%`}
            note={`${view.quality.branch.covered.toLocaleString()} of ${view.quality.branch.total.toLocaleString()} branches`}
            onClick={() => onGoTo("quality")}
          />
          <SummaryCell
            label="Mutation score"
            value={`${view.quality.mutation.score}%`}
            note={`${view.quality.mutation.killed} killed · ${view.quality.mutation.survived} survived`}
            onClick={() => onGoTo("quality")}
          />
          <SummaryCell
            label="Findings to resolve"
            value={view.findingCounts.toResolve}
            denominator={`of ${view.findings.length}`}
            tone={view.findingCounts.toResolve > 0 ? "caution" : "pass"}
            note={`${severity.critical} critical · ${severity.high} high · ${view.findingCounts.verified} re-verified`}
            onClick={() => onGoTo("security")}
          />
        </div>
        <p className="tp-den px-4 py-3 leading-relaxed">
          Decisions logged on this build: {view.decisions.approved} repairs approved, {view.decisions.rejected} rejected,{" "}
          {view.decisions.applied} fixes applied, {view.decisions.dismissed} findings dismissed. Approving the phase is a
          review of these decisions, not a new one.
          {view.awaitingRerun > 0 &&
            ` ${view.awaitingRerun} approved ${view.awaitingRerun === 1 ? "repair is" : "repairs are"} counted as passing from the guard run and will be recorded by Build ${view.build + 1}.`}
        </p>
      </Panel>

      <Panel
        icon={<Workflow className="h-4 w-4 text-blue-400" />}
        label="After you approve"
        title="Where an approved change goes next"
      >
        <ol className="grid gap-2 lg:grid-cols-4">
          {decisionChain.map((step, i) => (
            <li
              key={step.id}
              className="rounded-lg border border-slate-200 px-3.5 py-3 dark:border-white/[0.06]"
            >
              <p className="tp-label">
                {String(i + 1).padStart(2, "0")} · {step.label}
              </p>
              <p className="tp-prose mt-1.5 text-[12.5px]">{step.detail}</p>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel
        icon={<ScrollText className="h-4 w-4 text-blue-400" />}
        label="Audit log"
        title="Every decision on this phase, human and machine"
        meta={`${view.audit.length} entries`}
        action={
          <Button variant="outline" size="sm" onClick={() => exportCsv(view.audit, view.build)}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
        bodyClassName="p-0"
      >
        <div className="max-h-[460px] overflow-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr>
                <Th>When</Th>
                <Th>Who</Th>
                <Th>Action</Th>
                <Th>Target</Th>
                <Th>Detail</Th>
              </tr>
            </thead>
            <tbody>
              {view.audit.map((entry) => (
                <tr key={entry.id}>
                  <Td className="whitespace-nowrap font-mono text-[11px] text-slate-400 dark:text-slate-500">
                    {entry.at}
                  </Td>
                  <Td className="whitespace-nowrap text-[12.5px]">
                    <ActorMark actor={entry.actor} kind={entry.actorKind} />
                  </Td>
                  <Td className="whitespace-nowrap text-[12.5px] font-medium">{entry.action}</Td>
                  <Td className="font-mono text-[11px]">{entry.target}</Td>
                  <Td className="text-[12.5px]">{entry.detail}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

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
              Verified {last.at} — {last.note}. Everything from Build {view.build} stays in the branch history.
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
