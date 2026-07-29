import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Bug, Check, CheckCircle2, Clock, Inbox, ShieldAlert, Wrench, XCircle, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Badge, Button, Card, CardContent } from "@/components/ui/primitives";
import { Note, Panel, StateChip, TriageChip } from "@/components/testing/bits";
import { RepairProof } from "@/components/testing/RepairProof";
import { fileName, type TestingView, type ViewFailure } from "@/components/testing/view";

export type InboxFilter = "attention" | "regression" | "brittle" | "healed" | "awaiting" | "all";

const filterCards: {
  id: Exclude<InboxFilter, "attention" | "all">;
  label: string;
  icon: typeof Bug;
  color: string;
  key: keyof TestingView["inbox"];
}[] = [
  { id: "regression", label: "Real regressions", icon: XCircle, color: "text-red-400", key: "regressions" },
  { id: "brittle", label: "Brittle tests", icon: Wrench, color: "text-amber-400", key: "brittle" },
  { id: "healed", label: "Healed", icon: CheckCircle2, color: "text-emerald-400", key: "healed" },
  { id: "awaiting", label: "Awaiting you", icon: Clock, color: "text-blue-400", key: "awaiting" },
];

function matches(failure: ViewFailure, filter: InboxFilter, build: number) {
  const open = failure.build === build && failure.state !== "healed";
  switch (filter) {
    case "attention":
      return open;
    case "regression":
      return open && failure.triage === "regression";
    case "brittle":
      return open && failure.triage === "brittle";
    case "healed":
      return failure.state === "healed" || Boolean(failure.awaitingRerun);
    case "awaiting":
      return open && failure.state === "awaiting-approval";
    default:
      return true;
  }
}

export function StepHealing({
  view,
  filter,
  onFilter,
  selectedId,
  onSelect,
  onApprove,
  onReject,
  onOpenFile,
}: {
  view: TestingView;
  filter: InboxFilter;
  onFilter: (f: InboxFilter) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onOpenFile: (path: string, line: number, label: string) => void;
}) {
  const list = view.failures.filter((f) => matches(f, filter, view.build));
  const selected = view.failures.find((f) => f.id === selectedId) ?? list[0];
  // Below lg there is only room for one pane, so tapping a failure drills in
  // and a back control returns to the list. From lg up both are always visible.
  const [showDetail, setShowDetail] = useState(false);

  // Keep whatever is selected as long as it still exists, so deciding on a
  // repair leaves its outcome on screen instead of jumping to the next item.
  useEffect(() => {
    if (list.length === 0) return;
    if (!view.failures.some((f) => f.id === selectedId)) onSelect(list[0].id);
  }, [list, selectedId, onSelect, view.failures]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {filterCards.map((card) => {
          const Icon = card.icon;
          const count = view.inbox[card.key];
          const active = filter === card.id;
          return (
            <button
              key={card.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setShowDetail(false);
                onFilter(active ? "attention" : card.id);
              }}
              className="text-left"
            >
              <Card className={cn("h-full", active ? "border-blue-500/40 bg-blue-500/5" : "hover:border-blue-500/30")}>
                <CardContent className="flex items-center gap-3 p-4">
                  <Icon className={cn("h-7 w-7 shrink-0", card.color)} />
                  <div className="min-w-0">
                    <p className="tp-num text-2xl">{count}</p>
                    <p className="tp-label mt-0.5 truncate">{card.label}</p>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <Panel
          className={cn(showDetail && "hidden lg:block")}
          icon={<Inbox className="h-4 w-4 text-blue-400" />}
          label="Failure inbox"
          title={
            filter === "attention"
              ? `${list.length} to look at`
              : filter === "all"
              ? `${list.length} in this sprint`
              : `${list.length} ${filterCards.find((c) => c.id === filter)?.label.toLowerCase() ?? ""}`
          }
          meta="This list is the approval queue. Repairs are approved here and nowhere else."
          action={
            <button
              type="button"
              onClick={() => onFilter(filter === "all" ? "attention" : "all")}
              className="text-xs text-blue-600 underline underline-offset-2 dark:text-blue-400"
            >
              {filter === "all" ? "Needs attention" : "Show all"}
            </button>
          }
          bodyClassName="max-h-[620px] space-y-2 overflow-y-auto p-3"
        >
          {list.length === 0 && <Note className="px-1 py-4">Nothing here. Try another filter.</Note>}
          {list.map((failure) => {
            const active = failure.id === selected?.id;
            return (
              <button
                key={failure.id}
                type="button"
                onClick={() => {
                  onSelect(failure.id);
                  setShowDetail(true);
                }}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors",
                  active
                    ? "border-blue-500/40 bg-blue-500/5"
                    : "border-slate-200 hover:border-slate-300 dark:border-white/[0.06] dark:hover:border-white/15"
                )}
              >
                <p className="truncate font-mono text-xs font-medium">{failure.test}</p>
                <p className="tp-prose mt-1 line-clamp-2 text-xs">{failure.reason}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <TriageChip failure={failure} />
                  <StateChip failure={failure} />
                  <span className="tp-den ml-auto shrink-0">{failure.age}</span>
                </div>
              </button>
            );
          })}
        </Panel>

        {selected && (
          <div className={cn("min-w-0 space-y-3", !showDetail && "hidden lg:block")}>
            <button
              type="button"
              onClick={() => setShowDetail(false)}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 lg:hidden dark:text-blue-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to the inbox
            </button>
            <FailureDetail failure={selected} onApprove={onApprove} onReject={onReject} onOpenFile={onOpenFile} />
          </div>
        )}
      </div>
    </div>
  );
}

function FailureDetail({
  failure,
  onApprove,
  onReject,
  onOpenFile,
}: {
  failure: ViewFailure;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onOpenFile: (path: string, line: number, label: string) => void;
}) {
  const guardBlocked = failure.state === "blocked";
  const decidable = failure.state === "awaiting-approval" && Boolean(failure.repair);

  return (
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
  );
}
