import { Fragment } from "react";
import { ChevronDown, ChevronRight, ShieldAlert } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Td, Th } from "@/shared/ui/primitives";
import { FindingStatusChip, Panel, SeverityChip } from "../../bits/index";
import type { Finding } from "../../../fixtures/types";
import { shortPath, type StepId } from "../../../model/view";
import { SecurityFindingDetail } from "./SecurityFindingDetail";

export function SecurityFindingsList({
  findings,
  build,
  toResolve,
  expandedId,
  onExpand,
  onApplyFix,
  onDismiss,
  onGoTo,
}: {
  findings: Finding[];
  build: number;
  toResolve: number;
  expandedId: string | null;
  onExpand: (id: string | null) => void;
  onApplyFix: (id: string) => void;
  onDismiss: (id: string) => void;
  onGoTo: (step: StepId) => void;
}) {
  return (
    <Panel
      icon={<ShieldAlert className="h-4 w-4 text-blue-400" />}
      label="Findings"
      title="Two detectors ran and their results were combined"
      meta={`${findings.length} findings on build ${build} · ${toResolve} still to resolve`}
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
            {findings.map((finding) => {
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
                        <SecurityFindingDetail
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
  );
}
