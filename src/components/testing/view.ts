// One derivation for the whole phase.
//
// Every count on the page comes from here, so the failing count in the suite
// table, the failure inbox, the summary strip and the final report can never
// disagree. Three rules matter more than the arithmetic:
//
//   1. A repair you approve is counted as passing on the strength of the guard
//      run, but stays marked "awaiting re-run" until a full run confirms it.
//   2. A decision belongs to a build. When a newer build arrives, the phase
//      approval is superseded and the phase is waiting on a human again.
//   3. A proof that cannot answer is not a pass and not a fail. It is errored,
//      and it offers a retry.

import {
  appliedFixes as baseFixes,
  auditTrail,
  failures as baseFailures,
  findings as baseFindings,
  greenRun,
  quality as baseQuality,
  runTranscript,
  streamProgress,
  streamingTranscript,
  suiteModules,
  suiteTotals,
  testingRun,
  type AppliedFix,
  type AuditEntry,
  type ConsoleLine,
  type FailureItem,
  type Finding,
  type ProofState,
  type Quality,
  type SuiteModule,
} from "@/data/testingData";

export type PreviewState = "live" | "running" | "green" | "empty" | "error";

export type StepId = "tests" | "healing" | "quality" | "security" | "reverify" | "report";

export type StepState = "done" | "attention" | "waiting" | "running" | "pending";

/** Which build the decision was made against — a later build supersedes it. */
export type RepairDecision = { decision: "approved" | "rejected"; at: string; by: string; build: number };

export type FindingAction =
  | { kind: "applied"; at: string; by: string; scan: ProofState; suite: ProofState }
  | { kind: "dismissed"; at: string; by: string };

export type PhaseDecision = { kind: "approved" | "changes"; at: string; by: string; build: number; note?: string };

export type ViewFailure = FailureItem & {
  decision?: RepairDecision;
  /** approved, counted as passing, but no full run has confirmed it yet */
  awaitingRerun?: boolean;
};

export type ViewInput = {
  preview: PreviewState;
  reviewer: string;
  build: number;
  buildFinishedAt: string;
  repairDecisions: Record<string, RepairDecision>;
  findingActions: Record<string, FindingAction>;
  extraAudit: AuditEntry[];
  phaseDecision: PhaseDecision | null;
  stream: { lines: number; done: boolean };
};

export type TestingView = {
  preview: PreviewState;
  build: number;
  finishedAt: string;
  duration: string;
  /** true when this build is a re-run started from the page, not the recorded one */
  isRerun: boolean;
  modules: SuiteModule[];
  totals: { passed: number; failed: number; skipped: number; run: number; passRate: number };
  transcript: ConsoleLine[];
  transcriptTotal: number;
  streaming: boolean;
  failures: ViewFailure[];
  inbox: { regressions: number; brittle: number; healed: number; awaiting: number; needsAttention: number };
  /** repairs you approved that the next full run has still to confirm */
  awaitingRerun: number;
  quality: Quality;
  findings: Finding[];
  fixes: AppliedFix[];
  findingCounts: { open: number; proposed: number; reverifying: number; verified: number; dismissed: number; toResolve: number };
  decisions: { approved: number; rejected: number; applied: number; dismissed: number };
  audit: AuditEntry[];
  steps: Record<StepId, { state: StepState; count?: number; hint: string }>;
  /** the decision that applies to this build, if any */
  decision: PhaseDecision | null;
  /** a decision made against an earlier build, now superseded */
  superseded: PhaseDecision | null;
  decisionPending: boolean;
};

export const stepOrder: { id: StepId; label: string }[] = [
  { id: "tests", label: "Tests" },
  { id: "healing", label: "Healing" },
  { id: "quality", label: "Quality" },
  { id: "security", label: "Security" },
  { id: "reverify", label: "Fix and re-verify" },
  { id: "report", label: "Report and approval" },
];

export function fileName(path: string) {
  return path.split("/").pop() ?? path;
}

/** src/main/java/com/payflow/user/UserRepository.java → user/UserRepository.java */
export function shortPath(path: string) {
  const parts = path.split("/");
  return parts.slice(-2).join("/");
}

const isHealed = (state: ViewFailure["state"]) => state === "healed";

/* -------------------------------------------------------------- failures */

function decorateFailures(input: ViewInput, confirmedThrough: number): ViewFailure[] {
  const source = input.preview === "green" ? baseFailures.filter((f) => f.triage === "healed") : baseFailures;

  return source.map((failure) => {
    const decision = input.repairDecisions[failure.id];
    if (!decision) return failure;

    if (decision.decision === "approved") {
      const awaitingRerun = decision.build >= confirmedThrough;
      return {
        ...failure,
        decision,
        awaitingRerun,
        triage: "healed" as const,
        state: "healed" as const,
        note: awaitingRerun
          ? `You approved the repair at ${decision.at.slice(11)}. The guard already ran it against this build's code, so it counts as passing — the next full run records it.`
          : `You approved the repair at ${decision.at.slice(11)} and run ${decision.build + 1} confirmed it.`,
      };
    }

    return {
      ...failure,
      decision,
      state: "escalated" as const,
      note: `You rejected the repair at ${decision.at.slice(11)}. The test was left as it is and routed to the module owner.`,
    };
  });
}

function moduleCounts(failures: ViewFailure[], preview: PreviewState): SuiteModule[] {
  if (preview === "green") {
    return suiteModules.map((m) => ({ ...m, passed: m.passed + m.failed, failed: 0, skipped: 0 }));
  }

  return suiteModules.map((m) => {
    const open = failures.filter((f) => f.moduleId === m.id && f.triage !== "healed" && !isHealed(f.state));
    const repaired = m.failed - open.length;
    return {
      ...m,
      passed: m.passed + Math.max(0, repaired),
      failed: open.length,
      failureIds: open.map((f) => f.id),
    };
  });
}

/* ------------------------------------------------------------ transcript */

type RunFrame = { line: ConsoleLine; passed: number; failed: number };

function framesFromRecorded(lines: ConsoleLine[]): RunFrame[] {
  let current = { passed: 0, failed: 0 };
  return lines.map((line, i) => {
    if (streamProgress[i]) current = streamProgress[i];
    return { line, passed: current.passed, failed: current.failed };
  });
}

/**
 * A re-run is a new run: its output has to reflect the repairs that were
 * approved since the recorded one, otherwise the transcript and the counts
 * would disagree.
 */
function framesForRerun(modules: SuiteModule[], failures: ViewFailure[], build: number): RunFrame[] {
  const totals = suiteTotals(modules);
  const frames: RunFrame[] = [];
  let passed = 0;
  let failed = 0;
  const push = (line: ConsoleLine) => frames.push({ line, passed, failed });

  push({ kind: "cmd", text: "payflow test --all --coverage --mutation" });
  push({ kind: "muted", text: `re-running ${totals.run} tests · Build ${build} · ${testingRun.branch}` });

  (["frontend", "backend"] as const).forEach((side) => {
    push({
      kind: "info",
      text: side === "frontend" ? `frontend · ${testingRun.frontendRunner}` : `backend · ${testingRun.backendRunner}`,
    });

    modules
      .filter((m) => m.side === side)
      .forEach((m) => {
        failures
          .filter((f) => f.moduleId === m.id && f.triage !== "healed" && !isHealed(f.state))
          .forEach((f) => {
            failed += 1;
            push({ kind: "fail", text: f.test });
            push({ kind: "detail", text: `${f.reason} · ${fileName(f.file)}:${f.line}` });
          });

        passed += m.passed;
        push({ kind: "pass", text: `${m.name} · ${m.passed} tests · ${m.duration}` });
      });
  });

  push({
    kind: "summary",
    text: `${totals.run} tests run · ${totals.passed} passed · ${totals.failed} failed · ${totals.skipped} skipped · ${testingRun.duration}`,
  });
  push({
    kind: "muted",
    text:
      totals.failed > 0
        ? `handing ${totals.failed} ${totals.failed === 1 ? "failure" : "failures"} to triage`
        : "nothing to triage",
  });

  return frames;
}

/* ------------------------------------------------------------- findings */

function decorateFindings(input: ViewInput): Finding[] {
  return baseFindings.map((finding) => {
    if (input.preview === "green") {
      const late = greenRun.lateFixes[finding.id as keyof typeof greenRun.lateFixes];
      return {
        ...finding,
        status: "verified" as const,
        fix: finding.fix ?? (late ? { ...late } : undefined),
        openReason: undefined,
      };
    }

    const action = input.findingActions[finding.id];
    if (!action) return finding;
    if (action.kind === "dismissed") return { ...finding, status: "dismissed" as const };

    const verified = action.scan === "pass" && action.suite === "pass";
    return { ...finding, status: verified ? ("verified" as const) : ("re-verifying" as const) };
  });
}

function proofDetail(state: ProofState, kind: "scan" | "suite", finding: Finding, build: number) {
  if (kind === "scan") {
    if (state === "pass")
      return `1,412 files re-scanned · ${finding.cwe} no longer reported at ${fileName(finding.file)}:${finding.line} · no new findings`;
    if (state === "errored") return `The scan stopped before it finished · nothing was proven`;
    if (state === "running") return "Re-scanning 1,412 files";
    return "Queued";
  }
  if (state === "pass") return `223 tests run · the same result as before the fix, no new failures`;
  if (state === "errored") return `The suite re-run did not finish · superseded by Build ${build}`;
  if (state === "running") return "Re-running 223 tests";
  return "Starts when the re-scan finishes";
}

function decorateFixes(input: ViewInput, findings: Finding[]): AppliedFix[] {
  if (input.preview === "green") {
    return findings.map((finding, i) => ({
      findingId: finding.id,
      appliedBy: i % 2 === 0 ? "S. Patel" : "A. Chen",
      appliedAt: `2025-01-22 09:${String(20 + i * 3).padStart(2, "0")}`,
      scan: {
        state: "pass" as ProofState,
        at: "09:38",
        detail: `1,412 files re-scanned · ${finding.cwe} no longer reported at ${fileName(finding.file)}:${finding.line} · no new findings`,
      },
      suite: {
        state: "pass" as ProofState,
        at: "09:41",
        detail: "223 tests run · 223 passed · 0 failed · no new failures",
      },
      verdict: "Fixed and re-verified.",
    }));
  }

  const added: AppliedFix[] = Object.entries(input.findingActions)
    .filter((entry): entry is [string, Extract<FindingAction, { kind: "applied" }>] => entry[1].kind === "applied")
    .map(([id, action]) => {
      const finding = baseFindings.find((f) => f.id === id)!;
      const both = action.scan === "pass" && action.suite === "pass";
      const broken = action.scan === "errored" || action.suite === "errored";

      return {
        findingId: id,
        appliedBy: action.by,
        appliedAt: action.at,
        scan: {
          state: action.scan,
          at: action.scan === "pass" ? action.at.slice(11) : undefined,
          detail: proofDetail(action.scan, "scan", finding, input.build),
        },
        suite: {
          state: action.suite,
          at: action.suite === "pass" ? action.at.slice(11) : undefined,
          detail: proofDetail(action.suite, "suite", finding, input.build),
        },
        verdict: both
          ? "Fixed and re-verified."
          : broken
          ? "Not verified. A proof could not finish, so nothing was proven — retry it."
          : "Not verified yet — both proofs have to pass.",
      };
    });

  const superseded = new Set(Object.keys(input.findingActions));
  return [...added, ...baseFixes.filter((f) => !superseded.has(f.findingId))];
}

function greenQuality(): Quality {
  return {
    ...baseQuality,
    line: greenRun.quality.line,
    branch: greenRun.quality.branch,
    mutation: greenRun.quality.mutation,
    survivors: baseQuality.survivors.slice(0, 1),
    trend: [...baseQuality.trend, { build: greenRun.build, line: 93, branch: 84 }],
    byModule: baseQuality.byModule.map((m) => ({
      ...m,
      line: Math.min(99, m.line + 6),
      branch: Math.min(99, m.branch + 9),
    })),
  };
}

/* ------------------------------------------------------------------ view */

export function buildView(input: ViewInput): TestingView {
  const green = input.preview === "green";
  const running = input.preview === "running" && !input.stream.done;

  const build = green ? greenRun.build : input.build;
  const isRerun = !green && build > testingRun.build;

  // Only a finished run confirms anything.
  const confirmedThrough = running ? build - 1 : build;

  const failures = decorateFailures(input, confirmedThrough);
  const modules = moduleCounts(failures, input.preview);
  const settled = suiteTotals(modules);

  const frames = green
    ? framesFromRecorded(greenRun.transcript)
    : isRerun
    ? framesForRerun(modules, failures, build)
    : framesFromRecorded(input.preview === "running" ? streamingTranscript : runTranscript);

  const visible = running ? frames.slice(0, input.stream.lines + 1) : frames;
  const last = visible[visible.length - 1];
  const streamTotals = (() => {
    const passed = last?.passed ?? 0;
    const failed = last?.failed ?? 0;
    const run = passed + failed;
    return { passed, failed, skipped: 0, run, passRate: run === 0 ? 0 : (passed / run) * 100 };
  })();

  const totals = running ? streamTotals : settled;

  const openFailures = failures.filter((f) => f.triage !== "healed" && !isHealed(f.state));
  const inbox = {
    regressions: openFailures.filter((f) => f.triage === "regression").length,
    brittle: openFailures.filter((f) => f.triage === "brittle").length,
    healed: failures.filter((f) => isHealed(f.state)).length,
    awaiting: openFailures.filter((f) => f.state === "awaiting-approval").length,
    needsAttention: openFailures.length,
  };
  const awaitingRerun = failures.filter((f) => f.awaitingRerun).length;

  const findings = decorateFindings(input);
  const fixes = decorateFixes(input, findings);
  const findingCounts = {
    open: findings.filter((f) => f.status === "open").length,
    proposed: findings.filter((f) => f.status === "fix-proposed").length,
    reverifying: findings.filter((f) => f.status === "re-verifying").length,
    verified: findings.filter((f) => f.status === "verified").length,
    dismissed: findings.filter((f) => f.status === "dismissed").length,
    toResolve: findings.filter((f) => f.status !== "verified" && f.status !== "dismissed").length,
  };

  const quality = green ? greenQuality() : baseQuality;
  const audit = [...input.extraAudit, ...auditTrail];

  const repairValues = Object.values(input.repairDecisions);
  const decisions = {
    approved: repairValues.filter((d) => d.decision === "approved").length,
    rejected: repairValues.filter((d) => d.decision === "rejected").length,
    applied: fixes.length,
    dismissed: findingCounts.dismissed,
  };

  // Rule 2: an approval covers the build it was given for, and nothing later.
  const decisionForThisBuild = input.phaseDecision && input.phaseDecision.build === build ? input.phaseDecision : null;
  const superseded = input.phaseDecision && input.phaseDecision.build !== build ? input.phaseDecision : null;
  const decisionPending = !running && decisionForThisBuild === null;

  const brokenProof = fixes.some((f) => f.scan.state === "errored" || f.suite.state === "errored");

  const steps: Record<StepId, { state: StepState; count?: number; hint: string }> = {
    tests: running
      ? { state: "running", hint: `${totals.run} tests so far` }
      : {
          state: totals.failed > 0 ? "attention" : "done",
          count: totals.failed || undefined,
          hint: totals.failed > 0 ? `${totals.failed} failing` : `${totals.passed} passing`,
        },
    healing: running
      ? { state: "pending", hint: "waits for the run" }
      : inbox.awaiting > 0
      ? { state: "waiting", count: inbox.awaiting, hint: `${inbox.awaiting} awaiting you` }
      : inbox.needsAttention > 0
      ? { state: "attention", count: inbox.needsAttention, hint: `${inbox.needsAttention} with the developers` }
      : { state: "done", hint: "nothing open" },
    quality: running
      ? { state: "pending", hint: "waits for the run" }
      : { state: "done", hint: `mutation score ${quality.mutation.score}%` },
    security: running
      ? { state: "pending", hint: "waits for the run" }
      : findingCounts.toResolve > 0
      ? { state: "attention", count: findingCounts.toResolve, hint: `${findingCounts.toResolve} to resolve` }
      : { state: "done", hint: "nothing to resolve" },
    reverify: running
      ? { state: "pending", hint: "waits for the run" }
      : brokenProof
      ? { state: "attention", hint: "a proof did not finish" }
      : fixes.some((f) => f.suite.state === "running" || f.scan.state === "running")
      ? { state: "running", hint: "proof in progress" }
      : fixes.length === 0
      ? { state: "pending", hint: "no fix applied yet" }
      : fixes.every((f) => f.scan.state === "pass" && f.suite.state === "pass")
      ? { state: "done", hint: `${fixes.length} verified` }
      : { state: "attention", hint: "one fix unproven" },
    report: running
      ? { state: "pending", hint: "waits for the run" }
      : decisionForThisBuild
      ? { state: "done", hint: decisionForThisBuild.kind === "approved" ? "approved" : "changes requested" }
      : { state: "waiting", hint: superseded ? "waiting on you again" : "waiting on you" },
  };

  return {
    preview: input.preview,
    build,
    finishedAt: green ? greenRun.finishedAt : input.buildFinishedAt,
    duration: green ? greenRun.duration : testingRun.duration,
    isRerun,
    modules,
    totals,
    transcript: visible.map((f) => f.line),
    transcriptTotal: frames.length,
    streaming: running,
    failures,
    inbox,
    awaitingRerun,
    quality,
    findings,
    fixes,
    findingCounts,
    decisions,
    audit,
    steps,
    decision: decisionForThisBuild,
    superseded,
    decisionPending,
  };
}
