import { useMemo, useState } from "react";
import { ArrowUpRight, Clock, FileCode2, Package, RotateCcw, Rocket } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { Bar, Chip, Hairline, Metric, Note, Panel } from "@/components/phase/bits";
import { dependencyUpdates } from "@/data/mockData";
import { useStore } from "@/store/useStore";
import { cn } from "@/utils/cn";

type Update = (typeof dependencyUpdates)[number];

/**
 * The fused score decides which queue an update lands in. The thresholds are the
 * product rule, so they are stated on the page rather than hidden in a colour.
 */
const queues = [
  {
    id: "safe",
    label: "Safe to apply",
    rule: "Fused score under 30",
    detail: "The two predictors agree the change is routine, so applying it needs no review.",
    tone: "pass" as const,
    match: (u: Update) => u.fusedScore < 30,
  },
  {
    id: "review",
    label: "Read before applying",
    rule: "Fused score 30 to 70",
    detail: "Something in the changelog touches code this project actually calls.",
    tone: "caution" as const,
    match: (u: Update) => u.fusedScore >= 30 && u.fusedScore <= 70,
  },
  {
    id: "hold",
    label: "Hold",
    rule: "Fused score over 70",
    detail: "A breaking change is likely here. Plan the migration before the deploy, not during it.",
    tone: "fail" as const,
    match: (u: Update) => u.fusedScore > 70,
  },
];

const toneOf = (score: number) => (score > 70 ? "fail" : score >= 30 ? "caution" : "pass");

export function StageDependencies() {
  const addToast = useStore((s) => s.addToast);
  const [selectedId, setSelectedId] = useState(dependencyUpdates[1].id);

  const selected = useMemo(
    () => dependencyUpdates.find((u) => u.id === selectedId) ?? dependencyUpdates[0],
    [selectedId]
  );

  const grouped = queues.map((queue) => ({ ...queue, items: dependencyUpdates.filter(queue.match) }));

  return (
    <div className="space-y-5">
      <Panel
        icon={<Package className="h-4 w-4" />}
        label="Dependency check"
        title="Run before the build, because a dependency that breaks the build is cheaper to catch here"
      >
        <Note>
          Two predictors look at every proposed update. A rule based one reads the version change and the
          changelog. A language model reads the changelog against the code in this repository. Their scores
          are fused into one number, and that number decides which queue the update lands in.
        </Note>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {grouped.map((queue) => (
            <div key={queue.id} className="rounded-xl border border-[color:var(--tp-line)] px-3.5 py-3">
              <Metric
                label={queue.label}
                value={queue.items.length}
                denominator={queue.items.length === 1 ? "update" : "updates"}
                tone={queue.items.length ? queue.tone : "muted"}
                size="sm"
              />
              <p className="tp-den mt-1.5">{queue.rule}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="space-y-4">
          {grouped.map((queue) => (
            <Panel key={queue.id} label={queue.label} title={queue.detail} bodyClassName="space-y-2">
              {queue.items.length === 0 ? (
                <p className="tp-den">Nothing in this queue</p>
              ) : (
                queue.items.map((update) => {
                  const active = update.id === selected.id;
                  return (
                    <button
                      key={update.id}
                      type="button"
                      onClick={() => setSelectedId(update.id)}
                      aria-current={active}
                      className={cn(
                        "w-full rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                        active
                          ? "border-blue-500/50 bg-blue-500/[0.06]"
                          : "border-[color:var(--tp-line)] hover:border-blue-500/30"
                      )}
                    >
                      <p className="tp-mono truncate text-[12.5px] text-[color:var(--tp-ink-0)]">
                        {update.package}
                      </p>
                      <p className="tp-mono tp-den mt-1 flex items-center gap-1.5">
                        {update.currentVersion}
                        <ArrowUpRight className="h-3 w-3" />
                        {update.proposedVersion}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <Chip>{update.semver}</Chip>
                        <span className="tp-den">Fused score {update.fusedScore}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </Panel>
          ))}
        </div>

        <UpdateDetail
          update={selected}
          onApply={() =>
            addToast({
              type: "success",
              title: `${selected.package} queued`,
              message: `It goes in with the next build, moving to ${selected.proposedVersion}`,
            })
          }
          onHold={() =>
            addToast({
              type: "info",
              title: `${selected.package} held`,
              message: `Staying on ${selected.currentVersion} until the migration is planned`,
            })
          }
        />
      </div>
    </div>
  );
}

function UpdateDetail({
  update,
  onApply,
  onHold,
}: {
  update: Update;
  onApply: () => void;
  onHold: () => void;
}) {
  const tone = toneOf(update.fusedScore);
  const queue = queues.find((q) => q.match(update));

  return (
    <Panel
      label={update.package}
      title={`${update.currentVersion} to ${update.proposedVersion} · ${update.semver} release`}
      action={<Chip tone={tone}>{queue?.label}</Chip>}
      bodyClassName="space-y-5"
    >
      <div>
        <p className="tp-label">How the score was reached</p>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ScoreCell label="Rule based" value={update.ruleScore} note="Version change and changelog" />
          <ScoreCell label="Language model" value={update.llmScore} note="Changelog read against this code" />
          <ScoreCell label="Fused" value={update.fusedScore} note="The number the queue uses" strong tone={tone} />
        </div>
      </div>

      <div>
        <p className="tp-label">What the changelog says</p>
        <p className="tp-prose mt-1.5">{update.changelog}</p>
      </div>

      <div>
        <p className="tp-label">
          What this project actually calls
          {update.affectedFunctions > 0 ? ` · ${update.affectedFunctions} functions` : ""}
        </p>
        {update.impactedFiles.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {update.impactedFiles.map((file) => (
              <li key={file} className="flex items-center gap-2">
                <FileCode2 className="h-3.5 w-3.5 shrink-0 text-[color:var(--tp-muted)]" />
                <span className="tp-mono truncate text-[12.5px] text-[color:var(--tp-ink-1)]">{file}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="tp-den mt-1.5">
            No file in this repository calls anything the update changes, which is why the score is low.
          </p>
        )}
      </div>

      <div>
        <p className="tp-label">Migration</p>
        <pre className="tp-mono mt-1.5 whitespace-pre-wrap rounded-xl border border-[color:var(--tp-line)] px-3.5 py-2.5 text-[12px] leading-relaxed text-[color:var(--tp-ink-1)]">
          {update.migrationGuide}
        </pre>
      </div>

      <Hairline />

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={update.fusedScore > 70 ? "outline" : "primary"} onClick={onApply}>
          <Rocket className="h-3.5 w-3.5" />
          Apply with the next build
        </Button>
        <Button size="sm" variant="outline" onClick={onHold}>
          <RotateCcw className="h-3.5 w-3.5" />
          Stay on {update.currentVersion}
        </Button>
        <span className="tp-den ml-auto inline-flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {update.fusedScore > 70
            ? "Plan around 45 minutes for the migration"
            : update.fusedScore >= 30
            ? "Around 15 minutes to check the affected files"
            : "No work expected"}
        </span>
      </div>
    </Panel>
  );
}

function ScoreCell({
  label,
  value,
  note,
  strong,
  tone,
}: {
  label: string;
  value: number;
  note: string;
  strong?: boolean;
  tone?: "pass" | "caution" | "fail";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3.5 py-3",
        strong ? "border-blue-500/40 bg-blue-500/[0.05]" : "border-[color:var(--tp-line)]"
      )}
    >
      <Metric label={label} value={value} denominator="of 100" tone={strong ? tone : undefined} size="sm" />
      <Bar value={value} tone={strong ? tone ?? "ink" : "muted"} className="mt-2" />
      <p className="tp-den mt-1.5 leading-snug">{note}</p>
    </div>
  );
}
