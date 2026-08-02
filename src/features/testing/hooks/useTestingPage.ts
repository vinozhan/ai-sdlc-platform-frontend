import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSessionStore } from "@/store/session";
import { useUiStore } from "@/store/ui";
import { projectsApi, useProject } from "@/entities/project";
import { useSettings } from "@/entities/settings";
import { useEditorTabs } from "@/shared/hooks";
import type { InboxFilter } from "../components/steps/StepHealing";
import {
  buildView,
  fileName,
  stepOrder,
  type FindingAction,
  type PhaseDecision,
  type PreviewState,
  type RepairDecision,
  type StepId,
} from "../model/view";
import type { AuditEntry, Finding } from "../fixtures/types";
import { getTestingSnapshot } from "../api";

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

export function useTestingPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useUiStore((s) => s.theme);
  const addToast = useUiStore((s) => s.addToast);
  const activeProjectId = useSessionStore((s) => s.activeProjectId);
  const settings = useSettings();
  const isDark = theme === "dark";
  const stamp = useStamp();

  const project = useProject(activeProjectId ?? projectId);
  const reviewer = settings.profile.name;
  // Stable fixture snapshot for the demo page (cloning once avoids rebuild thrash).
  const data = useMemo(() => getTestingSnapshot(), []);
  const { failures, findings, run: testingRun } = data;

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

  const { tabs, activePath, openFile, closeTab, setActivePath } = useEditorTabs(DEFAULT_FILE);
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
        data,
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
    [data, effective, reviewer, build, buildFinishedAt, repairDecisions, findingActions, extraAudit, phaseDecision, stream]
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
    openFile(path);
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
    if (project) void projectsApi.update(project.id, { status: "deploy", progress: Math.max(project.progress, 82) });
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

  const selectFile = (path: string) => {
    openFile(path);
  };

  const goToFromSummary = (target: StepId) => {
    if (target === "healing") setInboxFilter("awaiting");
    setStep(target);
  };

  const openCode = () => navigate(`/projects/${project?.id ?? projectId}/code`);
  const retryLoad = () => navigate(`/projects/${project?.id ?? projectId}/testing`);
  const openDeployment = () => navigate(`/projects/${project?.id ?? projectId}/deployment`);

  return {
    project,
    projectId,
    isDark,
    effective,
    data,
    testingRun,
    view,
    running,
    step,
    setStep,
    stepperSteps,
    progressId,
    inboxFilter,
    setInboxFilter,
    selectedFailure,
    setSelectedFailure,
    expandedFinding,
    setExpandedFinding,
    tabs,
    activePath,
    highlight,
    viewerRef,
    startRerun,
    openFileAt,
    openFailure,
    approveRepair,
    rejectRepair,
    applyFix,
    dismissFinding,
    retryProofs,
    approvePhase,
    requestChanges,
    rollback,
    selectFile,
    selectTab: setActivePath,
    closeTab,
    goToFromSummary,
    openCode,
    retryLoad,
    openDeployment,
  };
}
