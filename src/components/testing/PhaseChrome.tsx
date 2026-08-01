import { SummaryCells, type SummaryCell } from "@/components/phase/PhaseChrome";
import type { StepId, TestingView } from "@/components/testing/view";

export { StickyHeader } from "@/components/phase/PhaseChrome";

/* ---------------------------------------------------------- summary strip */

type Cell = Omit<SummaryCell, "onGoTo"> & { goTo?: StepId };

export function SummaryStrip({ view, onGoTo }: { view: TestingView; onGoTo: (step: StepId) => void }) {
  const waiting = view.streaming;
  const dash = <span className="text-[color:var(--tp-muted)]">-</span>;

  const cells: Cell[] = [
    {
      label: "Tests passing",
      value: view.totals.passed,
      denominator: `of ${view.totals.run} run`,
      note: `pass rate ${view.totals.passRate.toFixed(1)}%`,
    },
    {
      label: "Failing",
      value: view.totals.failed,
      tone: view.totals.failed > 0 ? "fail" : "pass",
      note: view.totals.failed > 0 ? "open the failure inbox" : "nothing failing",
      goTo: view.totals.failed > 0 ? "healing" : undefined,
      goToLabel: "Open the failure inbox",
    },
    {
      label: "Repairs awaiting you",
      value: waiting ? dash : view.inbox.awaiting,
      tone: view.inbox.awaiting > 0 ? "caution" : undefined,
      note: waiting ? "waiting on this run" : view.inbox.awaiting > 0 ? "review in the inbox" : "none in the queue",
      goTo: !waiting && view.inbox.awaiting > 0 ? "healing" : undefined,
      goToLabel: "Review the repair queue",
    },
    {
      label: "Mutation score",
      value: waiting ? dash : `${view.quality.mutation.score}%`,
      note: waiting
        ? "waiting on this run"
        : `${view.quality.mutation.killed} killed · ${view.quality.mutation.survived} survived`,
      goTo: waiting ? undefined : "quality",
      goToLabel: "See test quality",
    },
    {
      label: "Findings to resolve",
      value: waiting ? dash : view.findingCounts.toResolve,
      denominator: waiting ? undefined : `of ${view.findings.length}`,
      tone: view.findingCounts.toResolve > 0 ? "caution" : "pass",
      note: waiting
        ? "waiting on this run"
        : `${view.findingCounts.open} open · ${view.findingCounts.proposed} fix proposed · ${view.findingCounts.reverifying} re-verifying`,
      goTo: waiting ? undefined : "security",
      goToLabel: "See security findings",
    },
  ];

  return (
    <SummaryCells
      cells={cells.map(({ goTo, ...cell }) => ({
        ...cell,
        onGoTo: goTo ? () => onGoTo(goTo) : undefined,
      }))}
    />
  );
}
