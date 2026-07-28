import { Fragment } from "react";
import { ArrowUpRight, Bot, Check, ChevronDown, ChevronRight, Cpu, GitCompare, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Badge, Button, Card, CardContent, Td, Th } from "@/components/ui/primitives";
import { FindingStatusChip, Note, Panel, SeverityChip, severityLabel } from "@/components/testing/bits";
import { CodeDiff } from "@/components/testing/RepairProof";
import { detectorComparison, severityOrder, type Finding, type Severity } from "@/data/testingData";
import { shortPath, type StepId, type TestingView } from "@/components/testing/view";

const severityTile: Record<Severity, { border: string; text: string }> = {
  critical: { border: "border-red-500/30", text: "text-red-500 dark:text-red-400" },
  high: { border: "border-orange-500/30", text: "text-orange-500 dark:text-orange-400" },
  medium: { border: "border-amber-500/30", text: "text-amber-500 dark:text-amber-400" },
  low: { border: "border-slate-300 dark:border-white/10", text: "text-slate-500 dark:text-slate-400" },
};

export function StepSecurity({
  view,
  expandedId,
  onExpand,
  onApplyFix,
  onDismiss,
  onGoTo,
}: {
  view: TestingView;
  expandedId: string | null;
  onExpand: (id: string | null) => void;
  onApplyFix: (id: string) => void;
  onDismiss: (id: string) => void;
  onGoTo: (step: StepId) => void;
}) {
  const counts = severityOrder.map((s) => ({
    severity: s,
    count: view.findings.filter((f) => f.severity === s).length,
  }));

  const statusRows = [
    { label: "Open", count: view.findingCounts.open, color: "#94a3b8" },
    { label: "Fix proposed", count: view.findingCounts.proposed, color: "#3b82f6" },
    { label: "Re-verifying", count: view.findingCounts.reverifying, color: "#f59e0b" },
    { label: "Fixed and re-verified", count: view.findingCounts.verified, color: "#10b981" },
    ...(view.findingCounts.dismissed
      ? [{ label: "Dismissed", count: view.findingCounts.dismissed, color: "#cbd5e1" }]
      : []),
  ];
  const total = view.findings.length || 1;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {counts.map(({ severity, count }) => (
            <Card key={severity} className={severityTile[severity].border}>
              <CardContent className="p-4">
                <p className="tp-label">{severityLabel[severity]}</p>
                <p
                  className={cn(
                    "mt-1 text-2xl font-bold tabular-nums",
                    count > 0 ? severityTile[severity].text : "text-slate-400 dark:text-slate-600"
                  )}
                >
                  {count}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-4">
            <p className="tp-label">Findings by status</p>
            <div className="mt-2.5 flex h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              {statusRows.map((row) =>
                row.count > 0 ? (
                  <span
                    key={row.label}
                    title={`${row.label}: ${row.count}`}
                    style={{ width: `${(row.count / total) * 100}%`, background: row.color }}
                  />
                ) : null
              )}
            </div>
            <ul className="mt-2.5 grid grid-cols-2 gap-x-4">
              {statusRows.map((row) => (
                <li key={row.label} className="flex items-center gap-2 py-0.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: row.color }} />
                  <span className="tp-den truncate">{row.label}</span>
                  <span className="ml-auto text-[13px] tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Panel
        icon={<ShieldAlert className="h-4 w-4 text-blue-400" />}
        label="Findings"
        title="Two detectors ran and their results were combined"
        meta={`${view.findings.length} findings on build ${view.build} · ${view.findingCounts.toResolve} still to resolve`}
        bodyClassName="p-0"
      >
        <div className="w-full overflow-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr>
                <Th>CWE</Th>
                <Th>Name</Th>
                <Th>Severity</Th>
                <Th className="text-right">CVSS</Th>
                <Th>Location</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {view.findings.map((finding) => {
                const open = expandedId === finding.id;
                return (
                  <Fragment key={finding.id}>
                    <tr
                      className={cn("cursor-pointer transition-colors", open && "bg-blue-500/5")}
                      onClick={() => onExpand(open ? null : finding.id)}
                    >
                      <Td>
                        <span className="flex items-center gap-1.5">
                          {open ? (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                          )}
                          <span className="font-mono text-xs">{finding.cwe}</span>
                        </span>
                      </Td>
                      <Td className="text-[13px]">{finding.name}</Td>
                      <Td>
                        <SeverityChip severity={finding.severity} />
                      </Td>
                      <Td className="text-right tabular-nums">{finding.cvss.toFixed(1)}</Td>
                      <Td className="font-mono text-[11px]">
                        {shortPath(finding.file)}:{finding.line}
                      </Td>
                      <Td>
                        <FindingStatusChip status={finding.status} />
                      </Td>
                    </tr>
                    {open && (
                      <tr>
                        <Td colSpan={6} className="bg-slate-50 p-4 dark:bg-white/[0.02]">
                          <FindingDetail
                            finding={finding}
                            onApplyFix={onApplyFix}
                            onDismiss={onDismiss}
                            onGoTo={onGoTo}
                          />
                        </Td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        icon={<GitCompare className="h-4 w-4 text-blue-400" />}
        label="Detector comparison"
        title="Why both detectors run"
        meta="One is fast, free and stays on your machine. The other reads more carefully. Together they miss the least."
        bodyClassName="p-0"
      >
        <div className="w-full overflow-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr>
                <Th>Detector</Th>
                <Th className="text-right">Precision</Th>
                <Th className="text-right">Recall</Th>
                <Th className="text-right">F1</Th>
                <Th className="text-right">Cost per scan</Th>
                <Th className="text-right">Median latency</Th>
                <Th>Runs offline</Th>
              </tr>
            </thead>
            <tbody>
              {detectorComparison.rows.map((row, i) => {
                const best = i === detectorComparison.rows.length - 1;
                return (
                  <tr key={row.detector} className={cn(best && "bg-blue-500/5")}>
                    <Td className={cn("text-[13px]", best && "font-semibold")}>{row.detector}</Td>
                    <Td className="text-right tabular-nums">{row.precision.toFixed(2)}</Td>
                    <Td className="text-right tabular-nums">{row.recall.toFixed(2)}</Td>
                    <Td className="text-right tabular-nums">{row.f1.toFixed(2)}</Td>
                    <Td className="text-right tabular-nums">{row.cost}</Td>
                    <Td className="text-right tabular-nums">{row.latency}</Td>
                    <Td>
                      {row.offline ? (
                        <Badge variant="success">
                          <Check className="h-3 w-3" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="default">
                          <X className="h-3 w-3" />
                          No
                        </Badge>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="tp-den border-t border-[color:var(--tp-line)] px-5 py-3 leading-relaxed">
          {detectorComparison.caption}
        </p>
      </Panel>
    </div>
  );
}

function FindingDetail({
  finding,
  onApplyFix,
  onDismiss,
  onGoTo,
}: {
  finding: Finding;
  onApplyFix: (id: string) => void;
  onDismiss: (id: string) => void;
  onGoTo: (step: StepId) => void;
}) {
  const canApply = Boolean(finding.fix) && (finding.status === "open" || finding.status === "fix-proposed");

  return (
    <div className="space-y-3.5">
      <div>
        <p className="tp-label">What the problem is</p>
        <Note className="mt-1.5 max-w-3xl">{finding.explanation}</Note>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="tp-label mr-1">Found by</span>
        {finding.foundBy.includes("local") && (
          <Badge variant="default">
            <Cpu className="h-3 w-3" />
            Local model
          </Badge>
        )}
        {finding.foundBy.includes("reviewer") && (
          <Badge variant="default">
            <Bot className="h-3 w-3" />
            AI reviewer
          </Badge>
        )}
        {finding.foundBy.length === 2 && <span className="tp-den">both detectors agreed on this one</span>}
        <span className="ml-auto font-mono text-[11px] text-[color:var(--tp-ink-2)]">
          {finding.file}:{finding.line}
        </span>
      </div>

      {finding.fix ? (
        <div>
          <p className="tp-label">Proposed fix</p>
          <Note className="mb-2 mt-1.5">{finding.fix.summary}</Note>
          <CodeDiff
            before={finding.fix.before}
            after={finding.fix.after}
            language={finding.fix.language}
            beforeLabel="Code today"
            afterLabel="Proposed fix"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <Note className="text-[12.5px]">{finding.openReason}</Note>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-[color:var(--tp-line)] pt-3.5">
        {canApply && (
          <>
            <Button variant="primary" size="sm" onClick={() => onApplyFix(finding.id)}>
              <ShieldCheck className="h-3.5 w-3.5" />
              Apply fix
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDismiss(finding.id)}>
              <X className="h-3.5 w-3.5" />
              Dismiss
            </Button>
            <p className="tp-den ml-auto max-w-sm text-right">
              Applying starts two proofs: the scan runs again, and so does the whole suite.
            </p>
          </>
        )}
        {(finding.status === "re-verifying" || finding.status === "verified") && (
          <button
            type="button"
            onClick={() => onGoTo("reverify")}
            className="inline-flex items-center gap-1.5 text-[13px] text-blue-600 underline underline-offset-2 dark:text-blue-400"
          >
            {finding.status === "verified" ? "See both proofs" : "Watch the proofs run"}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}
        {finding.status === "dismissed" && <Note className="text-[12.5px]">Dismissed. It stays in the audit log.</Note>}
        {!finding.fix && finding.status === "open" && <Note className="text-[12.5px]">Nothing to apply yet.</Note>}
      </div>
    </div>
  );
}
