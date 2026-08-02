import type { FileEntry } from "@/shared/code-viewer/buildFileTree";

export type SuiteModule = {
  id: string;
  name: string;
  side: "backend" | "frontend";
  runner: "JUnit 5" | "Vitest";
  passed: number;
  failed: number;
  skipped: number;
  duration: string;
  requirements: string[];
  failureIds: string[];
};

export type ConsoleLine = {
  kind: "cmd" | "info" | "pass" | "fail" | "skip" | "detail" | "summary" | "muted";
  text: string;
};

export type Triage = "brittle" | "regression" | "healed";

export type GuardCheck = { pass: boolean; detail: string };

export type Repair = {
  proposedAt: string;
  language: "java" | "tsx";
  original: string;
  proposed: string;
  guard: { unchanged: GuardCheck; planted: GuardCheck };
  verdictLine: string;
  why: string;
};

export type FailureItem = {
  id: string;
  test: string;
  moduleId: string;
  runner: "JUnit 5" | "Vitest";
  triage: Triage;
  /** brittle: awaiting your approval, or blocked by the guard and escalated */
  state: "awaiting-approval" | "blocked" | "escalated" | "healed";
  reason: string;
  age: string;
  at: string;
  build: number;
  requirement: { id: string; title: string };
  file: string;
  line: number;
  owner?: string;
  repair?: Repair;
  note?: string;
};

export type TestFileMeta = {
  requirement: string;
  requirementTitle: string;
  failureId?: string;
  healedId?: string;
};

export type Quality = {
  line: { percent: number; covered: number; total: number };
  branch: { percent: number; covered: number; total: number };
  mutation: { total: number; killed: number; survived: number; score: number };
  tool: string;
  byModule: { name: string; line: number; branch: number; covered: number; total: number }[];
  survivors: { location: string; change: string; note: string }[];
  trend: { build: number; line: number; branch: number }[];
  trendNote: string;
};

export type Severity = "critical" | "high" | "medium" | "low";
export type FindingStatus = "open" | "fix-proposed" | "re-verifying" | "verified" | "dismissed";
export type Detector = "local" | "reviewer";

export type Finding = {
  id: string;
  cwe: string;
  name: string;
  severity: Severity;
  cvss: number;
  file: string;
  line: number;
  status: FindingStatus;
  foundBy: Detector[];
  explanation: string;
  fix?: { before: string; after: string; language: "java" | "tsx"; summary: string };
  openReason?: string;
};

export type ProofState = "pass" | "fail" | "running" | "pending" | "errored";

export type AppliedFix = {
  findingId: string;
  appliedBy: string;
  appliedAt: string;
  scan: { state: ProofState; detail: string; at?: string };
  suite: { state: ProofState; detail: string; at?: string };
  verdict: string;
};

export type AuditActorKind = "human" | "agent" | "guard";

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  actorKind: AuditActorKind;
  action: string;
  target: string;
  detail: string;
};

export type TestingRun = {
  sprint: string;
  build: number;
  branch: string;
  startedAt: string;
  finishedAt: string;
  duration: string;
  frontendRunner: string;
  backendRunner: string;
  lastVerified: {
    sprint: string;
    build: number;
    at: string;
    note: string;
  };
};

export type GreenRun = {
  build: number;
  finishedAt: string;
  duration: string;
  quality: {
    line: { percent: number; covered: number; total: number };
    branch: { percent: number; covered: number; total: number };
    mutation: { total: number; killed: number; survived: number; score: number };
  };
  lateFixes: Record<
    string,
    { language: "java" | "tsx"; summary: string; before: string; after: string }
  >;
  transcript: ConsoleLine[];
};

export type DecisionChainStep = {
  id: string;
  label: string;
  detail: string;
};

export type DetectorComparison = {
  caption: string;
  rows: {
    detector: string;
    precision: number;
    recall: number;
    f1: number;
    cost: string;
    latency: string;
    offline: boolean;
  }[];
};

export type { FileEntry };
