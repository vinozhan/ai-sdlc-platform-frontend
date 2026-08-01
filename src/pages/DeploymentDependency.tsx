import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Rocket } from "lucide-react";
import { PhaseSectionHeader } from "@/components/project/PhaseSectionHeader";
import { ChevronStepper } from "@/components/ui/ChevronStepper";
import { SummaryCells, StickyHeader, type SummaryCell } from "@/components/phase/PhaseChrome";
import { DecisionBar } from "@/components/phase/DecisionBar";
import { Note, Panel } from "@/components/phase/bits";
import { DemoBadge } from "@/components/deployment/DemoBadge";
import { DeploymentStatusChip } from "@/components/deployment/bits";
import { StageConnect } from "@/components/deployment/StageConnect";
import { StageDependencies } from "@/components/deployment/StageDependencies";
import { StageRelease } from "@/components/deployment/StageRelease";
import { StageVerify, gateVerdict, useProofs } from "@/components/deployment/StageVerify";
import { StageLive } from "@/components/deployment/StageLive";
import { dependencyUpdates } from "@/data/mockData";
import { getBindings, getDeployments, getReleases, promoteDeployment } from "@/lib/orchestrator";
import { useScenario } from "@/lib/useScenario";
import { useStore } from "@/store/useStore";
import type { Binding, Deployment, Release } from "@/types/platform";

type StageId = "connect" | "dependencies" | "release" | "verify" | "live";

const stages: { id: StageId; label: string }[] = [
  { id: "connect", label: "Connect" },
  { id: "dependencies", label: "Dependencies" },
  { id: "release", label: "Release" },
  { id: "verify", label: "Verify and approve" },
  { id: "live", label: "Live" },
];

export function DeploymentDependency() {
  const { projectId } = useParams();
  const theme = useStore((s) => s.theme);
  const projects = useStore((s) => s.projects);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const addToast = useStore((s) => s.addToast);
  const isDark = theme === "dark";
  const scenario = useScenario();

  const project = useMemo(
    () => projects.find((p) => p.id === (projectId ?? activeProjectId)),
    [projects, projectId, activeProjectId]
  );
  const id = project?.id ?? "";

  const [stage, setStage] = useState<StageId>("connect");
  const [bindings, setBindings] = useState<Binding[] | null>(null);
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [decided, setDecided] = useState<null | "approved" | "changes">(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setDecided(null);
    Promise.all([getBindings(id), getDeployments(id), getReleases(id)]).then(([b, d, r]) => {
      if (cancelled) return;
      setBindings(b);
      setDeployment(d[0] ?? null);
      setReleases(r);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id, scenario]);

  const { proofs, loading: proofsLoading } = useProofs(deployment?.id ?? null);

  const started = (bindings?.length ?? 0) > 0;
  const verdict = gateVerdict(proofs);
  // The bar appears as soon as a preview build exists that nobody has decided
  // about, and stays put while the proofs finish. It says why it cannot be used
  // yet rather than appearing only once it can.
  const awaitingGate =
    decided === null &&
    deployment?.env === "preview" &&
    (deployment.status === "awaiting-gate" || deployment.status === "verifying");
  const currentRelease = releases.find((r) => r.current) ?? null;
  const held = dependencyUpdates.filter((u) => u.fusedScore > 70).length;
  const bound = bindings?.filter((b) => b.status === "bound").length ?? 0;

  // How far the phase has actually got. A stage is reachable as soon as it has
  // something to show, so a reviewer is never locked out of a step that exists.
  const stagesDone = [
    started,
    started,
    Boolean(deployment) && deployment!.steps.every((s) => s.state === "done"),
    verdict.armed,
    Boolean(currentRelease) && !awaitingGate,
  ];
  const progressId: string = !started
    ? "connect"
    : stagesDone.every(Boolean)
    ? "done"
    : currentRelease
    ? "live"
    : deployment?.status === "awaiting-gate"
    ? "verify"
    : deployment
    ? "release"
    : "dependencies";
  const progress = Math.round((stagesDone.filter(Boolean).length / stagesDone.length) * 100);

  const cells: SummaryCell[] = [
    {
      label: "This deployment",
      value: deployment ? <DeploymentStatusChip status={deployment.status} /> : "Not started",
      note: deployment ? `${deployment.env} · ${deployment.id}` : "no run yet",
      onGoTo: () => setStage("release"),
      goToLabel: "Open the release step",
    },
    {
      label: "Proofs passed",
      value: proofs.filter((p) => p.state === "pass").length,
      denominator: `of ${proofs.length || 2}`,
      tone: verdict.armed ? "pass" : proofs.some((p) => p.state === "fail") ? "fail" : "caution",
      note: verdict.armed ? "the gate is armed" : "the gate stays closed",
      onGoTo: () => setStage("verify"),
      goToLabel: "Open the verification step",
    },
    {
      label: "Current release",
      value: currentRelease?.version ?? "None",
      tone: currentRelease?.verified ? "pass" : currentRelease ? "caution" : "muted",
      note: currentRelease
        ? currentRelease.verified
          ? `verified ${currentRelease.deployedAt.slice(5, 10)}`
          : "not verified"
        : "nothing in production",
      onGoTo: () => setStage("live"),
      goToLabel: "Open the live step",
    },
    {
      label: "Updates on hold",
      value: held,
      tone: held > 0 ? "caution" : "pass",
      note: held > 0 ? "breaking changes likely" : "nothing blocked",
      onGoTo: () => setStage("dependencies"),
      goToLabel: "Open the dependency step",
    },
    {
      label: "Bindings",
      value: bound,
      denominator: "of 4",
      tone: bound === 4 ? "pass" : "caution",
      note: bound === 4 ? "all resources exist" : "some are missing",
      onGoTo: () => setStage("connect"),
      goToLabel: "Open the connect step",
    },
  ];

  if (!project) {
    return (
      <div className="w-full p-4 sm:p-6 md:p-8">
        <Panel label="Deployment">
          <Note>Pick a project to see its deployment.</Note>
        </Panel>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 p-4 sm:p-6 md:p-8">
      <StickyHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <PhaseSectionHeader
              title="Deployment"
              subtitle="Wire the project to its providers, check the dependencies, ship to preview, prove it works, then decide about production."
              progress={progress}
              isDark={isDark}
            />
          </div>
          <div className="shrink-0 pt-1">
            <DemoBadge />
          </div>
        </div>

        <ChevronStepper
          steps={stages}
          progressId={progressId}
          selectedId={stage}
          isDark={isDark}
          onStepClick={(next) => setStage(next as StageId)}
        />

        {started && <SummaryCells cells={cells} />}
      </StickyHeader>

      {loading ? (
        <Panel label="Deployment">
          <p className="tp-den flex items-center gap-2">
            <Loader2 className="tp-spin h-3.5 w-3.5" />
            Loading this project
          </p>
        </Panel>
      ) : !started ? (
        <NotStarted name={project.name} />
      ) : (
        <>
          {stage === "connect" && <StageConnect projectId={id} />}
          {stage === "dependencies" && <StageDependencies />}
          {stage === "release" && (
            <StageRelease projectId={id} deployment={deployment} onDeploymentChange={setDeployment} />
          )}
          {stage === "verify" && (
            <StageVerify deployment={deployment} proofs={proofs} loading={proofsLoading} />
          )}
          {stage === "live" && (
            <StageLive projectId={id} releases={releases} onReleasesChange={setReleases} />
          )}
        </>
      )}

      {started && awaitingGate && (
        <DecisionBar
          title={verdict.armed ? "Production is waiting on you" : "This build is not ready for a decision yet"}
          detail={`${deployment?.commit.sha} · ${deployment?.commit.message}`}
          approveLabel="Approve and go to production"
          noteLabel="What needs to change before this goes to production"
          notePlaceholder="Hold this until the Render connection is back."
          approveDisabled={!verdict.armed}
          disabledReason={verdict.text}
          onApprove={async () => {
            if (!deployment) return;
            const release = await promoteDeployment(deployment.id);
            setReleases((current) => [release, ...current.map((r) => ({ ...r, current: false }))]);
            setDeployment({ ...deployment, status: "live" });
            setDecided("approved");
            setStage("live");
            addToast({
              type: "success",
              title: `${release.version} is in production`,
              message: `Approved by ${release.approvedBy}`,
            });
          }}
          onRequestChanges={(note) => {
            setDecided("changes");
            addToast({ type: "info", title: "Sent back for changes", message: note });
          }}
        />
      )}
    </div>
  );
}

function NotStarted({ name }: { name: string }) {
  return (
    <Panel icon={<Rocket className="h-4 w-4" />} label="Not started" title={`${name} has not reached Deployment yet`}>
      <Note>
        This phase waits on the Testing gate. Once the validation report for this project is approved,
        Deployment creates the frontend, backend and database it needs, ships to preview, and runs the two
        proofs before offering production as a decision.
      </Note>
      <Note className="mt-2.5">
        Nothing is created before then, so there is no half configured project sitting at a provider in the
        meantime.
      </Note>
    </Panel>
  );
}
