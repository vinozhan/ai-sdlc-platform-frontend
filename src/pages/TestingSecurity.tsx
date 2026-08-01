import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Play } from "lucide-react";
import { useStore } from "@/store/useStore";
import type { EditorTab } from "@/components/code/VSCodeEditor";
import { Button } from "@/components/ui/primitives";
import { ChevronStepper } from "@/components/ui/ChevronStepper";
import { PhaseSectionHeader } from "@/components/project/PhaseSectionHeader";
import { DecisionBar } from "@/components/phase/DecisionBar";
import { PhaseLoadError, PhaseNotStarted } from "@/components/testing/EmptyStates";
import { StickyHeader, SummaryStrip } from "@/components/testing/PhaseChrome";
import { StepHealing, type InboxFilter } from "@/components/testing/steps/StepHealing";
import { StepQuality } from "@/components/testing/steps/StepQuality";
import { StepReport } from "@/components/testing/steps/StepReport";
import { StepReverify } from "@/components/testing/steps/StepReverify";
import { StepSecurity } from "@/components/testing/steps/StepSecurity";
import { StepTests } from "@/components/testing/steps/StepTests";
import {
  buildView,
  fileName,
  stepOrder,
  type FindingAction,
  type PhaseDecision,
  type PreviewState,
  type RepairDecision,
  type StepId,
} from "@/components/testing/view";
import { failures, findings, testingRun, type AuditEntry, type Finding } from "@/data/testingData";

const DEFAULT_FILE = "backend/src/test/java/com/payflow/payments/PaymentControllerTest.java";

/**
 * The page normally derives its state from the project and from the run.
 * These are reachable for review without adding a control to the UI:
 * ?state=running | green | empty | error
 */
const demoStates: PreviewState[] = ["running", "green", "empty", "error"];

/** Mock clock so a decision made now lands after the last logged event. */
function useStamp() {
  const tick = useRef(0);
  return useCallback(() => {
    const minutes = 15 * 60 + 22 + tick.current * 2;
    tick.current += 1;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `2025-01-21 ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }, []);
}

export function TestingSecurity() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, projects, activeProjectId, settings, addToast, updateProject } = useStore();
  const isDark = theme === "dark";
  const stamp = useStamp();

  const project = useMemo(
    () => projects.find((p) => p.id === (activeProjectId ?? projectId)),
    [projects, activeProjectId, projectId]
  );
  const reviewer = settings.profile.name;

  const [preview, setPreview] = useState<PreviewState>("live");
  const [step, setStep] = useState<StepId>("tests");
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("attention");
  const [selectedFailure, setSelectedFailure] = useState(failures[0].id);
  const [expandedFinding, setExpandedFinding] = useState<string | null>(findings[0].id);
  const [repairDecisions, setRepairDecisions] = useState<Record<string, RepairDecision>>({});
  const [extraAudit, setExtraAudit] = useState<AuditEntry[]>([]);
  const [stream, setStream] = useState({ lines: 0, done: false });

  // Which build the page is showing, and when that build's run finished.
  // "Run tests again" produces the next build, which is what supersedes a
  // decision and confirms an approved repair.
  const [build, setBuild] = useState(testingRun.build);
  const [buildFinishedAt, setBuildFinishedAt] = useState(testingRun.finishedAt);

  // One security fix was still being proven when the page loaded.
  const [findingActions, setFindingActions] = useState<Record<string, FindingAction>>({
    v6: { kind: "applied", at: "2025-01-21 15:14", by: "A. Chen", scan: "pass", suite: "running" },
  });

  const [phaseDecision, setPhaseDecision] = useState<PhaseDecision | null>(() =>
    project && ["deploy", "complete"].includes(project.status)
      ? { kind: "approved", at: "2025-01-21 15:24", by: settings.profile.name, build: testingRun.build }
      : null
  );

  const [tabs, setTabs] = useState<EditorTab[]>([{ path: DEFAULT_FILE }]);
  const [activePath, setActivePath] = useState(DEFAULT_FILE);
  const [highlight, setHighlight] = useState<{ path: string; line: number; label?: string } | undefined>({
    path: DEFAULT_FILE,
    line: failures[0].line,
    label: failures[0].reason,
  });
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<number[]>([]);
  const transcriptTotal = useRef(1);
  const actionsRef = useRef<Record<string, FindingAction>>({});
  const settledBuild = useRef(testingRun.build);

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  // A project that has not produced a build yet has nothing to show here.
  const notStarted = project ? ["draft", "analyzing", "design", "code"].includes(project.status) : false;
  const requested = searchParams.get("state") as PreviewState | null;
  const fromUrl = requested && demoStates.includes(requested) ? requested : null;
  const effective: PreviewState = preview !== "live" ? preview : fromUrl ?? (notStarted ? "empty" : "live");

  const view = useMemo(
    () =>
      buildView({
        preview: effective,
        reviewer,
        build,
        buildFinishedAt,
        repairDecisions,
        findingActions,
        extraAudit,
        phaseDecision,
        stream,
      }),
    [effective, reviewer, build, buildFinishedAt, repairDecisions, findingActions, extraAudit, phaseDecision, stream]
  );
  transcriptTotal.current = view.transcriptTotal;
  actionsRef.current = findingActions;

  const logEntries = useCallback(
    (entries: Omit<AuditEntry, "id">[]) =>
      setExtraAudit((prev) => [...entries.map((e, i) => ({ ...e, id: `local-${prev.length}-${i}` })), ...prev]),
    []
  );

  /* --------------------------------------------------------------- the run */

  useEffect(() => {
    if (effective !== "running") return;
    setStream({ lines: 0, done: false });
    const id = window.setInterval(() => {
      setStream((s) => {
        if (s.lines >= transcriptTotal.current - 1) {
          window.clearInterval(id);
          return { lines: s.lines, done: true };
        }
        return { lines: s.lines + 1, done: false };
      });
    }, 380);
    return () => window.clearInterval(id);
  }, [effective]);

  // A finished run is what confirms approved repairs and stamps the build.
  useEffect(() => {
    if (effective !== "running" || !stream.done || settledBuild.current === build) return;
    settledBuild.current = build;
    const at = stamp();
    setBuildFinishedAt(at);
    logEntries([
      {
        at,
        actor: "Testing agent",
        actorKind: "agent",
        action: "Ran suite",
        target: `Build ${build}`,
        detail: `${view.totals.run} tests run, ${view.totals.passed} passed, ${view.totals.failed} failed.`,
      },
    ]);
    addToast({
      type: view.totals.failed > 0 ? "info" : "success",
      title: `Build ${build} finished`,
      message: `${view.totals.passed} passing, ${view.totals.failed} failing`,
    });
    setPreview("live");
  }, [effective, stream.done, build, stamp, logEntries, addToast, view.totals]);

  // The suite re-run that was in flight when the page loaded finishes here.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setFindingActions((prev) => {
        const current = prev.v6;
        if (!current || current.kind !== "applied" || current.suite !== "running") return prev;
        return { ...prev, v6: { ...current, suite: "pass" } };
      });
      setExtraAudit((prev) =>
        prev.some((e) => e.id === "reverify-v6")
          ? prev
          : [
              {
                id: "reverify-v6",
                at: "2025-01-21 15:19",
                actor: "Testing agent",
                actorKind: "agent",
                action: "Re-ran suite",
                target: "Build 1852",
                detail: "Same result as before the deserialization fix, no new failures.",
              },
              ...prev,
            ]
      );
    }, 7000);
    timers.current.push(id);
    return () => window.clearTimeout(id);
  }, []);

  const startRerun = () => {
    const next = build + 1;
    const at = stamp();

    // A proof that has not finished cannot survive a new build - it was proving
    // something about the old one.
    setFindingActions((prev) => {
      const updated: Record<string, FindingAction> = {};
      let broken = 0;
      Object.entries(prev).forEach(([id, action]) => {
        if (action.kind !== "applied" || (action.scan === "pass" && action.suite === "pass")) {
          updated[id] = action;
          return;
        }
        broken += 1;
        updated[id] = {
          ...action,
          scan: action.scan === "pass" ? "pass" : "errored",
          suite: action.suite === "pass" ? "pass" : "errored",
        };
      });
      if (broken > 0) {
        logEntries([
          {
            at,
            actor: "Testing agent",
            actorKind: "agent",
            action: "Stopped proofs",
            target: `${broken} unfinished ${broken === 1 ? "proof" : "proofs"}`,
            detail: `Build ${next} started, so proofs against Build ${build} were stopped. They prove nothing and can be retried.`,
          },
        ]);
      }
      return updated;
    });

    setBuild(next);
    logEntries([
      {
        at,
        actor: reviewer,
        actorKind: "human",
        action: "Started run",
        target: `Build ${next}`,
        detail: "Re-ran the full suite, including every repair approved since the last run.",
      },
    ]);
    setPreview("running");
    setStep("tests");
  };

  /* ------------------------------------------------------------- item decisions */

  const openFileAt = (path: string, line: number, label: string) => {
    setTabs((prev) => (prev.some((t) => t.path === path) ? prev : [...prev, { path }]));
    setActivePath(path);
    setHighlight({ path, line, label });
    setStep("tests");
    timers.current.push(
      window.setTimeout(() => viewerRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }), 80)
    );
  };

  const openFailure = (failureId: string) => {
    const failure = view.failures.find((f) => f.id === failureId);
    if (!failure) return;
    setSelectedFailure(failureId);
    setInboxFilter(failure.state === "healed" ? "healed" : "attention");
    setStep("healing");
  };

  const approveRepair = (id: string) => {
    const failure = failures.find((f) => f.id === id);
    if (!failure) return;
    const at = stamp();
    setRepairDecisions((prev) => ({ ...prev, [id]: { decision: "approved", at, by: reviewer, build } }));
    logEntries([
      {
        at,
        actor: "Testing agent",
        actorKind: "agent",
        action: "Applied repair",
        target: fileName(failure.file),
        detail: `Applied the approved repair. Counted as passing from the guard run - Build ${build + 1} will record it.`,
      },
      {
        at,
        actor: reviewer,
        actorKind: "human",
        action: "Approved repair",
        target: failure.test,
        detail: "Both guard checks passed: it still catches the planted bug.",
      },
    ]);
    addToast({
      type: "success",
      title: "Repair approved",
      message: "Counted as passing - the next run confirms it",
    });
  };

  const rejectRepair = (id: string) => {
    const failure = failures.find((f) => f.id === id);
    if (!failure) return;
    const at = stamp();
    setRepairDecisions((prev) => ({ ...prev, [id]: { decision: "rejected", at, by: reviewer, build } }));
    logEntries([
      {
        at,
        actor: "Testing agent",
        actorKind: "agent",
        action: "Escalated failure",
        target: failure.test,
        detail: `Repair rejected by a reviewer. Left the test as written and routed it to ${failure.owner ?? "the module owner"}.`,
      },
      {
        at,
        actor: reviewer,
        actorKind: "human",
        action: "Rejected repair",
        target: failure.test,
        detail: "Rejected the proposed repair.",
      },
    ]);
    addToast({ type: "info", title: "Repair rejected", message: "The failure went to the module owner untouched" });
  };

  /** Both proofs, in order: the scan answers first, then the suite. */
  const runProofs = (finding: Finding, retry: boolean) => {
    const stillRunning = (id: string, proof: "scan" | "suite") => {
      const action = actionsRef.current[id];
      return Boolean(action && action.kind === "applied" && action[proof] !== "errored");
    };

    timers.current.push(
      window.setTimeout(() => {
        setFindingActions((prev) => {
          const current = prev[finding.id];
          // A proof stopped by a newer build stays stopped - this answer is stale.
          if (!current || current.kind !== "applied" || current.scan !== "running") return prev;
          return { ...prev, [finding.id]: { ...current, scan: "pass", suite: "running" } };
        });
        if (!stillRunning(finding.id, "scan")) return;
        logEntries([
          {
            at: stamp(),
            actor: "Security agent",
            actorKind: "agent",
            action: retry ? "Re-scanned again" : "Re-scanned",
            target: fileName(finding.file),
            detail: `${finding.cwe} no longer reported. Suite re-run started.`,
          },
        ]);
      }, 1800)
    );

    timers.current.push(
      window.setTimeout(() => {
        setFindingActions((prev) => {
          const current = prev[finding.id];
          if (!current || current.kind !== "applied" || current.suite !== "running") return prev;
          return { ...prev, [finding.id]: { ...current, suite: "pass" } };
        });
        if (!stillRunning(finding.id, "suite")) return;
        logEntries([
          {
            at: stamp(),
            actor: "Testing agent",
            actorKind: "agent",
            action: "Re-ran suite",
            target: `Build ${build}`,
            detail: "Same result as before the fix, no new failures.",
          },
        ]);
        addToast({
          type: "success",
          title: "Fixed and re-verified",
          message: `${finding.cwe} is gone and behaviour did not change`,
        });
      }, 4400)
    );
  };

  const applyFix = (id: string) => {
    const finding = findings.find((f) => f.id === id);
    if (!finding) return;
    const at = stamp();
    setFindingActions((prev) => ({
      ...prev,
      [id]: { kind: "applied", at, by: reviewer, scan: "running", suite: "pending" },
    }));
    logEntries([
      {
        at,
        actor: reviewer,
        actorKind: "human",
        action: "Applied fix",
        target: `${fileName(finding.file)}:${finding.line}`,
        detail: finding.fix?.summary ?? "Applied the proposed fix.",
      },
    ]);
    addToast({ type: "info", title: "Fix applied", message: "Two proofs are running - scan and suite" });
    setStep("reverify");
    runProofs(finding, false);
  };

  const retryProofs = (id: string) => {
    const finding = findings.find((f) => f.id === id);
    if (!finding) return;
    setFindingActions((prev) => {
      const current = prev[id];
      if (!current || current.kind !== "applied") return prev;
      return { ...prev, [id]: { ...current, scan: "running", suite: "pending" } };
    });
    logEntries([
      {
        at: stamp(),
        actor: reviewer,
        actorKind: "human",
        action: "Retried proofs",
        target: `${finding.cwe} · ${fileName(finding.file)}:${finding.line}`,
        detail: `Started both proofs again against Build ${build}.`,
      },
    ]);
    addToast({ type: "info", title: "Proofs restarted", message: "Scan first, then the full suite" });
    runProofs(finding, true);
  };

  const dismissFinding = (id: string) => {
    const finding = findings.find((f) => f.id === id);
    if (!finding) return;
    const at = stamp();
    setFindingActions((prev) => ({ ...prev, [id]: { kind: "dismissed", at, by: reviewer } }));
    logEntries([
      {
        at,
        actor: reviewer,
        actorKind: "human",
        action: "Dismissed finding",
        target: `${finding.cwe} · ${fileName(finding.file)}:${finding.line}`,
        detail: "Dismissed without a fix. It stays in the log.",
      },
    ]);
    addToast({ type: "info", title: "Finding dismissed", message: "It stays in the audit log" });
  };

  /* ------------------------------------------------------------ phase decision */

  const approvePhase = () => {
    const at = stamp();
    setPhaseDecision({ kind: "approved", at, by: reviewer, build });
    logEntries([
      {
        at,
        actor: reviewer,
        actorKind: "human",
        action: "Approved the phase",
        target: `Build ${build}`,
        detail: "Approved the validation report for this build. Deployment can start.",
      },
    ]);
    if (project) updateProject(project.id, { status: "deploy", progress: Math.max(project.progress, 82) });
    addToast({ type: "success", title: `Build ${build} approved`, message: "Deployment can start" });
    setStep("report");
  };

  const requestChanges = (note: string) => {
    const at = stamp();
    setPhaseDecision({ kind: "changes", at, by: reviewer, build, note });
    logEntries([
      {
        at,
        actor: reviewer,
        actorKind: "human",
        action: "Requested changes",
        target: `Build ${build}`,
        detail: note,
      },
    ]);
    addToast({ type: "warning", title: "Changes requested", message: "The note went to the team" });
    setStep("report");
  };

  const rollback = () => {
    const at = stamp();
    logEntries([
      {
        at,
        actor: reviewer,
        actorKind: "human",
        action: "Rolled back",
        target: `Build ${testingRun.lastVerified.build}`,
        detail: `Returned the deployable build to ${testingRun.lastVerified.sprint} · Build ${testingRun.lastVerified.build}.`,
      },
    ]);
    addToast({
      type: "warning",
      title: `Returned to Build ${testingRun.lastVerified.build}`,
      message: testingRun.lastVerified.note,
    });
  };

  /* --------------------------------------------------------------------- render */

  const running = effective === "running" && !stream.done;

  /* The same chevron bar the other phases use. Counts ride inside the chevron
     so a reviewer can see where the work is without opening a step. */
  const stepBadges: Partial<Record<StepId, number>> = {
    tests: view.totals.failed || undefined,
    healing: view.inbox.awaiting || view.inbox.needsAttention || undefined,
    security: view.findingCounts.toResolve || undefined,
  };
  const stepperSteps = stepOrder.map((s) => ({ id: s.id, label: s.label, badge: stepBadges[s.id] }));
  const progressId = running ? "tests" : view.decision ? "done" : "report";

  const header = (
    <PhaseSectionHeader
      title="Testing & Security"
      subtitle="Tests are written from the requirements, run, and triaged. Every repair and every fix has to prove itself before you approve the phase."
      progress={view.progress}
      isDark={isDark}
      action={
        <Button variant="outline" onClick={startRerun} disabled={running}>
          <Play className="h-3.5 w-3.5" />
          {running ? "Running…" : "Run tests again"}
        </Button>
      }
    />
  );

  if (effective === "empty" || effective === "error") {
    return (
      <div className="tp w-full px-6 pb-10 pt-6 md:px-8 md:pt-8">
        {header}
        <div className="mt-8">
          {effective === "empty" ? (
            <PhaseNotStarted
              projectName={project?.name ?? "this project"}
              onOpenCode={() => navigate(`/projects/${project?.id ?? projectId}/code`)}
            />
          ) : (
            <PhaseLoadError
              build={testingRun.build}
              onRetry={() => navigate(`/projects/${project?.id ?? projectId}/testing`)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="tp w-full px-4 pb-6 pt-4 sm:px-6 md:px-8 md:pt-8">
      {header}

      <div className="mt-5">
        <StickyHeader>
          <ChevronStepper
            steps={stepperSteps}
            progressId={progressId}
            selectedId={step}
            isDark={isDark}
            onStepClick={(id) => setStep(id as StepId)}
          />
        </StickyHeader>
      </div>

      <div role="tabpanel" className="space-y-4 pt-5">
        {step === "tests" && (
          <>
            <SummaryStrip
              view={view}
              onGoTo={(target) => {
                if (target === "healing") setInboxFilter("awaiting");
                setStep(target);
              }}
            />
            <StepTests
              view={view}
              onGoTo={setStep}
              onOpenFailure={openFailure}
              tabs={tabs}
              activePath={activePath}
              highlight={highlight}
              onSelectFile={(path) => {
                setTabs((prev) => (prev.some((t) => t.path === path) ? prev : [...prev, { path }]));
                setActivePath(path);
              }}
              onSelectTab={setActivePath}
              onCloseTab={(path) =>
                setTabs((prev) => {
                  const next = prev.filter((t) => t.path !== path);
                  if (next.length === 0) return prev;
                  if (activePath === path) setActivePath(next[next.length - 1].path);
                  return next;
                })
              }
              viewerRef={viewerRef}
            />
          </>
        )}

        {step === "healing" && (
          <StepHealing
            view={view}
            filter={inboxFilter}
            onFilter={setInboxFilter}
            selectedId={selectedFailure}
            onSelect={setSelectedFailure}
            onApprove={approveRepair}
            onReject={rejectRepair}
            onOpenFile={openFileAt}
          />
        )}

        {step === "quality" && <StepQuality view={view} />}

        {step === "security" && (
          <StepSecurity
            view={view}
            expandedId={expandedFinding}
            onExpand={setExpandedFinding}
            onApplyFix={applyFix}
            onDismiss={dismissFinding}
            onGoTo={setStep}
          />
        )}

        {step === "reverify" && <StepReverify view={view} onGoTo={setStep} onRetry={retryProofs} />}

        {step === "report" && (
          <StepReport
            view={view}
            onGoTo={setStep}
            onOpenDeployment={() => navigate(`/projects/${project?.id ?? projectId}/deployment`)}
            onRollback={rollback}
          />
        )}
      </div>

      {view.decisionPending && (
        <div className="mt-6">
          <DecisionBar
            title={
              view.superseded
                ? `Build ${view.build} arrived after your approval, so this phase is waiting on you again`
                : "This phase is waiting on you"
            }
            detail={
              [
                view.inbox.awaiting > 0 ? `${view.inbox.awaiting} repairs awaiting you` : null,
                view.inbox.regressions > 0 ? `${view.inbox.regressions} regressions with the developers` : null,
                view.findingCounts.toResolve > 0 ? `${view.findingCounts.toResolve} findings to resolve` : null,
              ]
                .filter(Boolean)
                .join(" · ") || "Everything in this phase has settled"
            }
            approveLabel="Approve and start Deployment"
            noteLabel="What needs to change before this can ship"
            notePlaceholder="The KYC regression has to be fixed before Deployment starts."
            onApprove={approvePhase}
            onRequestChanges={requestChanges}
          />
        </div>
      )}
    </div>
  );
}
