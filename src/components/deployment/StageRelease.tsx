import { useEffect, useMemo, useRef, useState } from "react";
import { FileCode2, Loader2, Play, Rocket, RotateCcw, ScrollText, Workflow } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { Console, Hairline, Note, Panel, type ConsoleLine } from "@/components/phase/bits";
import { VSCodeFileTree } from "@/components/code/VSCodeFileTree";
import { VSCodeEditor, type EditorTab } from "@/components/code/VSCodeEditor";
import { StepStateChip, providerName } from "@/components/deployment/bits";
import { deployConfigContents, deployConfigFiles } from "@/data/platformData";
import { getDeployment, getDeployPlan, startDeployment, streamDeploymentLogs } from "@/lib/orchestrator";
import { useScenario } from "@/lib/useScenario";
import type { DeployPlan, Deployment } from "@/types/platform";

export function StageRelease({
  projectId,
  deployment,
  onDeploymentChange,
}: {
  projectId: string;
  deployment: Deployment | null;
  onDeploymentChange: (next: Deployment) => void;
}) {
  const scenario = useScenario();
  const [plan, setPlan] = useState<DeployPlan | null>(null);
  const [lines, setLines] = useState<ConsoleLine[]>([]);
  const [streaming, setStreaming] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  const [activePath, setActivePath] = useState(deployConfigFiles[0].path);
  const [openPaths, setOpenPaths] = useState<string[]>([deployConfigFiles[0].path]);

  useEffect(() => {
    let cancelled = false;
    getDeployPlan(projectId).then((next) => {
      if (!cancelled) setPlan(next);
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // A scenario switch describes a different run, so the transcript from the old
  // one must not linger underneath it.
  useEffect(() => {
    stopRef.current?.();
    stopRef.current = null;
    setStreaming(false);
    setLines([]);
  }, [scenario]);

  useEffect(() => () => stopRef.current?.(), []);

  const tabs: EditorTab[] = useMemo(() => openPaths.map((path) => ({ path })), [openPaths]);

  const openFile = (path: string) => {
    setActivePath(path);
    setOpenPaths((current) => (current.includes(path) ? current : [...current, path]));
  };

  const closeTab = (path: string) => {
    setOpenPaths((current) => {
      const next = current.filter((p) => p !== path);
      if (path === activePath && next.length) setActivePath(next[next.length - 1]);
      return next.length ? next : current;
    });
  };

  const run = async () => {
    stopRef.current?.();
    setLines([]);
    setStreaming(true);
    const next = await startDeployment(projectId, "preview");
    onDeploymentChange(next);
    stopRef.current = streamDeploymentLogs(
      next.id,
      (line) => setLines((current) => [...current, line]),
      async () => {
        setStreaming(false);
        // The log has finished, so the run has an outcome. Read it back rather
        // than leaving the page on the state the run started in.
        onDeploymentChange(await getDeployment(next.id));
      }
    );
  };

  const steps = deployment?.steps ?? [];
  const compensating = steps.some((s) => s.state === "compensated" || s.state === "compensating");

  return (
    <div className="space-y-5">
      {plan && <PlanPanel plan={plan} />}

      <Panel
        icon={<Workflow className="h-4 w-4" />}
        label="The run"
        title={
          deployment
            ? `${deployment.id} · commit ${deployment.commit.sha} · ${deployment.commit.message}`
            : "Nothing has run for this project yet"
        }
        action={
          <Button variant="primary" disabled={streaming} onClick={run}>
            {streaming ? <Loader2 className="tp-spin h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {streaming ? "Running" : "Deploy to preview"}
          </Button>
        }
      >
        {steps.length === 0 ? (
          <Note>
            Deploying builds both applications and publishes them to the preview environment. Production is
            a separate decision you make in the next step, once the proofs come back.
          </Note>
        ) : (
          <ol className="space-y-2">
            {steps.map((step) => (
              <li
                key={step.id}
                className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5 rounded-xl border border-[color:var(--tp-line)] px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-[13px] text-[color:var(--tp-ink-0)]">{step.label}</p>
                  {step.detail && <p className="tp-den mt-0.5 leading-relaxed">{step.detail}</p>}
                  {step.resource && (
                    <p className="tp-mono tp-den mt-0.5 truncate">{step.resource}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {step.duration && <span className="tp-den">{step.duration}</span>}
                  <StepStateChip state={step.state} />
                </div>
              </li>
            ))}
          </ol>
        )}

        {deployment?.failure && (
          <div className="mt-4 rounded-xl border border-[color:var(--tp-fail)]/25 bg-[color:var(--tp-fail)]/[0.06] px-3.5 py-3">
            <p className="flex items-center gap-2 text-[13px] font-medium text-[color:var(--tp-ink-0)]">
              <RotateCcw className="h-3.5 w-3.5 text-[color:var(--tp-fail)]" />
              The run stopped at {deployment.failure.step} and was undone
            </p>
            <p className="tp-prose mt-1.5">{deployment.failure.reason}</p>
            {deployment.failure.compensated && (
              <p className="tp-prose mt-1.5">
                Everything created before that point was deleted again, in reverse order, so no resource was
                left behind at any provider. Running this again is safe: each step carries the same key, so a
                resource that already exists is reused rather than created twice.
              </p>
            )}
          </div>
        )}

        {compensating && !deployment?.failure && (
          <p className="tp-den mt-3">Steps marked undone were rolled back after a later step failed.</p>
        )}
      </Panel>

      <Panel
        icon={<ScrollText className="h-4 w-4" />}
        label="Deploy log"
        title="Streamed from the run, with environment values redacted before they reach this screen"
        bodyClassName="p-0"
      >
        <Console
          label="Deploy log"
          lines={lines}
          streaming={streaming}
          meta={deployment ? `${deployment.id} · ${deployment.env}` : undefined}
          emptyText="Nothing has run yet. Deploy to preview to see the log."
          className="h-[260px] rounded-none border-0 sm:h-[340px]"
        />
      </Panel>

      <Panel
        icon={<FileCode2 className="h-4 w-4" />}
        label="Generated configuration"
        title="What the platform wrote so each provider knows what to build"
        bodyClassName="p-0"
      >
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="min-w-0 border-b border-[color:var(--tp-line)] lg:border-b-0 lg:border-r">
            <VSCodeFileTree
              title="Explorer"
              files={deployConfigFiles}
              selectedPath={activePath}
              onSelect={openFile}
            />
          </div>
          <div className="min-h-0 min-w-0">
            <VSCodeEditor
              tabs={tabs}
              activePath={activePath}
              contents={deployConfigContents}
              onSelectTab={setActivePath}
              onCloseTab={closeTab}
              showLanguage
              copyable
            />
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------- the artefact */

function PlanPanel({ plan }: { plan: DeployPlan }) {
  return (
    <Panel
      icon={<Rocket className="h-4 w-4" />}
      label="Deployment plan"
      title="Written before anything runs, so you can read what will happen and in what order"
      meta={`${plan.planId} · ${plan.generatedBy} · ${plan.generatedAt}`}
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <p className="tp-label">What it will use</p>
          <ul className="mt-2 space-y-2">
            {plan.targets.map((target) => (
              <li key={target.role} className="rounded-xl border border-[color:var(--tp-line)] px-3.5 py-2.5">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[13px] font-medium capitalize text-[color:var(--tp-ink-0)]">
                    {target.role}
                  </span>
                  <span className="tp-den">on {providerName[target.provider]}</span>
                </p>
                <p className="tp-mono mt-0.5 text-[12.5px] text-[color:var(--tp-ink-1)]">{target.resource}</p>
                <p className="tp-den mt-1 leading-relaxed">
                  {[target.rootDir, target.runtime, target.note].filter(Boolean).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="tp-label">The order, and what gets undone</p>
          <ol className="mt-2 space-y-1.5">
            {plan.steps.map((step, i) => (
              <li key={step.id} className="flex gap-2.5">
                <span className="tp-mono tp-den mt-0.5 w-4 shrink-0 text-right">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-[13px] text-[color:var(--tp-ink-0)]">{step.label}</p>
                  <p className="tp-den mt-0.5">
                    {step.compensation ? `If a later step fails: ${step.compensation.toLowerCase()}` : "Nothing to undo"}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <Hairline className="my-3.5" />

          <p className="tp-label">How the parts find each other</p>
          <ul className="mt-2 space-y-1">
            {plan.wiring.map((wire) => (
              <li key={wire.name} className="tp-den leading-relaxed">
                <span className="tp-mono text-[color:var(--tp-ink-1)]">{wire.name}</span> gives {wire.from}{" "}
                {wire.to}
              </li>
            ))}
          </ul>

          <Hairline className="my-3.5" />

          <p className="tp-label">Rollback</p>
          <Note className="mt-1.5">{plan.rollback.note}</Note>
        </div>
      </div>
    </Panel>
  );
}
