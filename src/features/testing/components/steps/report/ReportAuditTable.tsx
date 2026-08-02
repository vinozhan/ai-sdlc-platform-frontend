import { Download, ScrollText } from "lucide-react";
import { Button, Td, Th } from "@/shared/ui/primitives";
import { ActorMark, Panel } from "../../bits";
import type { AuditEntry } from "../../../fixtures/types";
import type { TestingView } from "../../../model/view";

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

export function ReportAuditTable({ view }: { view: TestingView }) {
  return (
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
  );
}
