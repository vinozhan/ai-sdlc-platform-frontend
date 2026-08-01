import { useEffect, useState } from "react";
import { Activity, CheckCircle2, History, Loader2, MessageSquareReply, RotateCcw } from "lucide-react";
import { Button, Card } from "@/components/ui/primitives";
import { ActorMark, Chip, Hairline, Note, Panel } from "@/components/phase/bits";
import { SourceMark } from "@/components/deployment/bits";
import { getActivity, getFeedback, getMetrics, rollback } from "@/lib/orchestrator";
import { useScenario } from "@/lib/useScenario";
import { useStore } from "@/store/useStore";
import type { ActivityEntry, FeedbackReport, Metric, Release } from "@/types/platform";

export function StageLive({
  projectId,
  releases,
  onReleasesChange,
}: {
  projectId: string;
  /** Owned by the page, because promoting from the decision bar changes it too. */
  releases: Release[];
  onReleasesChange: (next: Release[]) => void;
}) {
  const scenario = useScenario();
  const addToast = useStore((s) => s.addToast);

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [feedback, setFeedback] = useState<FeedbackReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<Release | null>(null);
  const [rollingBack, setRollingBack] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getMetrics(projectId), getActivity(projectId), getFeedback(projectId)]).then(
      ([m, a, f]) => {
        if (cancelled) return;
        setMetrics(m);
        setActivity(a);
        setFeedback(f);
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [projectId, scenario]);

  const current = releases.find((r) => r.current) ?? null;
  const rollbackTarget = releases.find((r) => !r.current && r.verified) ?? null;

  const doRollback = async (target: Release) => {
    setRollingBack(true);
    try {
      const next = await rollback(projectId, target.version);
      onReleasesChange(releases.map((r) => ({ ...r, current: r.version === next.version })));
      setConfirming(null);
      addToast({
        type: "success",
        title: `Rolled back to ${next.version}`,
        message: "The database schema was left in place",
      });
    } finally {
      setRollingBack(false);
    }
  };

  if (loading) {
    return (
      <Panel label="Live">
        <p className="tp-den flex items-center gap-2">
          <Loader2 className="tp-spin h-3.5 w-3.5" />
          Loading
        </p>
      </Panel>
    );
  }

  if (releases.length === 0) {
    return (
      <Panel icon={<Activity className="h-4 w-4" />} label="Live">
        <Note>
          Nothing is in production yet. Once a preview passes both proofs and you approve it, the release
          shows up here with the numbers it is judged on and the option to go back to it later.
        </Note>
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="px-3.5 py-3">
            <p className="tp-label truncate">{metric.label}</p>
            <p
              className="tp-num mt-0.5 text-xl"
              style={{
                color:
                  metric.tone === "pass"
                    ? "var(--tp-pass)"
                    : metric.tone === "fail"
                    ? "var(--tp-fail)"
                    : metric.tone === "caution"
                    ? "var(--tp-caution)"
                    : undefined,
              }}
            >
              {metric.value}
            </p>
            <SourceMark source={metric.source} window={metric.window} demo={metric.demo} />
          </Card>
        ))}
      </div>

      <Panel
        icon={<History className="h-4 w-4" />}
        label="Releases"
        title={current ? `${current.version} is serving production` : "No release is current"}
        action={
          rollbackTarget && (
            <Button size="sm" variant="outline" onClick={() => setConfirming(rollbackTarget)}>
              <RotateCcw className="h-3.5 w-3.5" />
              Roll back
            </Button>
          )
        }
      >
        {confirming && (
          <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-3.5 py-3">
            <p className="text-[13px] font-medium text-[color:var(--tp-ink-0)]">
              Roll production back to {confirming.version}?
            </p>
            <p className="tp-prose mt-1.5">
              This returns the application to {confirming.version}, which was verified on{" "}
              {confirming.deployedAt} and approved by {confirming.approvedBy ?? "nobody"}. Migrations only
              ever move forward, so the database schema stays where it is. The schema is built to keep
              working with the previous release, which is what makes this safe.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <Button size="sm" variant="error" disabled={rollingBack} onClick={() => doRollback(confirming)}>
                {rollingBack ? <Loader2 className="tp-spin h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                Roll back to {confirming.version}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirming(null)}>
                Stay on {current?.version ?? "the current release"}
              </Button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {releases.map((release) => (
            <li
              key={release.version}
              className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 rounded-xl border border-[color:var(--tp-line)] px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="tp-mono text-[13px] font-medium text-[color:var(--tp-ink-0)]">
                    {release.version}
                  </span>
                  {release.current && <Chip tone="info">Current</Chip>}
                  {release.verified ? (
                    <Chip tone="pass" icon={<CheckCircle2 className="h-3 w-3" />}>
                      Verified
                    </Chip>
                  ) : (
                    <Chip tone="caution">Not verified</Chip>
                  )}
                </p>
                <p className="tp-den mt-1 leading-relaxed">{release.note}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="tp-den">{release.deployedAt}</p>
                <p className="tp-den mt-0.5">
                  {release.approvedBy ? `Approved by ${release.approvedBy}` : "No approver recorded"}
                </p>
                <p className="tp-mono tp-den mt-0.5">{release.commit}</p>
              </div>
            </li>
          ))}
        </ul>

        <Hairline className="my-3.5" />
        <p className="tp-den">
          Verified means both proofs passed on that release's own URL. A release without it can still be
          rolled back to, but the platform will not claim it was checked.
        </p>
      </Panel>

      {feedback && feedback.items.length > 0 && (
        <Panel
          icon={<MessageSquareReply className="h-4 w-4" />}
          label="Back to requirements"
          title="What running in production has taught the project so far"
          meta={`${feedback.reportId} · ${feedback.generatedAt}`}
        >
          <ul className="space-y-2.5">
            {feedback.items.map((item) => (
              <li key={item.summary} className="rounded-xl border border-[color:var(--tp-line)] px-3.5 py-2.5">
                <p className="flex flex-wrap items-center gap-2">
                  <Chip>{item.kind}</Chip>
                  <span className="text-[13px] text-[color:var(--tp-ink-0)]">{item.summary}</span>
                </p>
                <p className="tp-den mt-1.5 leading-relaxed">{item.evidence}</p>
                <p className="tp-prose mt-1.5">Suggested requirement: {item.suggestedRequirement}</p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {activity.length > 0 && (
        <Panel
          icon={<Activity className="h-4 w-4" />}
          label="Activity"
          title="Every step this phase took, including the ones it undid"
        >
          <ul className="space-y-2.5">
            {activity.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="tp-mono tp-den w-[9.5rem] shrink-0">{entry.at}</span>
                <span className="text-[12.5px] text-[color:var(--tp-ink-1)]">
                  <ActorMark actor={entry.actor} kind={entry.actorKind} />
                </span>
                <span className="text-[12.5px] text-[color:var(--tp-ink-0)]">{entry.action}</span>
                <span className="tp-mono tp-den">{entry.target}</span>
                <span className="tp-den w-full leading-relaxed sm:w-auto sm:flex-1">{entry.detail}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
