import { Check, GitCompare, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Badge, Card, CardContent, Td, Th } from "@/shared/ui/primitives";
import { Panel, severityLabel } from "../bits/index";
import type { DetectorComparison, Severity } from "../../fixtures/types";
import type { StepId, TestingView } from "../../model/view";
import { SecurityFindingsList } from "./security/SecurityFindingsList";

const severityTile: Record<Severity, { border: string; text: string }> = {
  critical: { border: "border-red-500/30", text: "text-red-500 dark:text-red-400" },
  high: { border: "border-orange-500/30", text: "text-orange-500 dark:text-orange-400" },
  medium: { border: "border-amber-500/30", text: "text-amber-500 dark:text-amber-400" },
  low: { border: "border-slate-300 dark:border-white/10", text: "text-slate-500 dark:text-slate-400" },
};

export function StepSecurity({
  view,
  severityOrder,
  detectorComparison,
  expandedId,
  onExpand,
  onApplyFix,
  onDismiss,
  onGoTo,
}: {
  view: TestingView;
  severityOrder: Severity[];
  detectorComparison: DetectorComparison;
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
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

      <SecurityFindingsList
        findings={view.findings}
        build={view.build}
        toResolve={view.findingCounts.toResolve}
        expandedId={expandedId}
        onExpand={onExpand}
        onApplyFix={onApplyFix}
        onDismiss={onDismiss}
        onGoTo={onGoTo}
      />

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
