// Shapes the browser exchanges with the orchestrator.
//
// These mirror the future contracts/*.schema.json. When those schemas exist and
// packages/contracts-ts is generated, this file is deleted and the generated
// types are imported in its place. Nothing here is UI state: it is the wire
// shape, so the swap is an import change and not a rewrite.

/* ------------------------------------------------------------ connections */
// Workspace scope. Made once in Settings, held server side, never in the browser.

export type ProviderId = "github" | "vercel" | "render" | "neon" | "atlas";

export type ConnectionStatus = "connected" | "expired" | "not-connected";

/** An account or organisation the connection can be made against. */
export type ProviderAccount = {
  id: string;
  label: string;
  kind: "personal" | "organisation";
  note?: string;
};

/**
 * A default this connection applies when it creates resources. Choices make it a
 * picker, no choices makes it a free text field. None of these is a credential.
 */
export type ConnectionOption = {
  key: string;
  label: string;
  value: string;
  help: string;
  choices?: string[];
};

export type Connection = {
  provider: ProviderId;
  name: string;
  purpose: string;
  status: ConnectionStatus;
  /** the org or account the token belongs to, null when not connected */
  account: string | null;
  /** what the connection may do, in plain words */
  scopes: string[];
  /** what it deliberately cannot do, so the consent step can say so */
  limits: string[];
  /** what the connection may be made against */
  availableAccounts: ProviderAccount[];
  /** the defaults this connection uses when it creates resources */
  options: ConnectionOption[];
  lastUsed: string | null;
  /** project ids that hold a binding against this connection */
  usedByProjects: string[];
  expiredNote?: string;
};

/* --------------------------------------------------------------- bindings */
// Project scope. Born in the phase that first needs them, never created by hand.

export type BindingKind = "repository" | "frontend" | "backend" | "database";

export type BindingStatus = "bound" | "provisioning" | "connection-missing" | "not-created";

export type Binding = {
  kind: BindingKind;
  provider: ProviderId;
  /** the resource as the provider names it */
  resourceName: string;
  detail: string;
  /** provider dashboard link, null while it does not exist yet */
  url: string | null;
  status: BindingStatus;
  bornIn: "Code Generation" | "Deployment";
};

/* ------------------------------------------------------- environment values */

export type EnvScope = "preview" | "production";

export type EnvValue = {
  name: string;
  preview: string | null;
  production: string | null;
  /** deployment wrote it, or a human did */
  setBy: "deployment" | "you";
  /** for wiring rows: what the value points at, in plain words */
  pointsAt?: string;
  secret: boolean;
};

/* ------------------------------------------------------------- deploy plan */
// The artefact C4 produces. Reviewable before anything runs, and the record the
// runner executes against. Mirrors contracts/deploy-plan.schema.json.

export type StackTrack = "spring-boot" | "mern";

export type DeployPlanTarget = {
  role: "frontend" | "backend" | "database";
  provider: ProviderId;
  /** what will be created, or the existing resource that will be reused */
  resource: string;
  rootDir?: string;
  runtime?: string;
  note?: string;
};

export type DeployPlanStep = {
  id: string;
  label: string;
  /** the step that must succeed first */
  dependsOn: string | null;
  /** what to undo if a later step fails */
  compensation: string | null;
};

export type DeployPlan = {
  planId: string;
  projectId: string;
  generatedBy: string;
  generatedAt: string;
  stack: StackTrack;
  targets: DeployPlanTarget[];
  steps: DeployPlanStep[];
  wiring: { name: string; from: string; to: string }[];
  rollback: {
    strategy: "application-only";
    note: string;
  };
};

/* -------------------------------------------------------------- deployments */

export type DeployStepState =
  | "pending"
  | "running"
  | "done"
  | "failed"
  | "compensating"
  | "compensated";

export type DeployStep = {
  id: string;
  label: string;
  state: DeployStepState;
  detail?: string;
  duration?: string;
  /** the resource the step created, once it has one */
  resource?: string;
};

export type DeploymentStatus =
  | "not-started"
  | "provisioning"
  | "building"
  | "verifying"
  | "awaiting-gate"
  | "live"
  | "failed"
  | "rolled-back";

export type Deployment = {
  id: string;
  projectId: string;
  env: EnvScope;
  status: DeploymentStatus;
  steps: DeployStep[];
  previewUrl: string | null;
  startedAt: string;
  finishedAt: string | null;
  commit: { sha: string; message: string; author: string };
  /** set when the run failed and compensation ran */
  failure?: { step: string; reason: string; compensated: boolean };
};

/* ------------------------------------------------------------------ proofs */

export type ProofOutcome = "pending" | "running" | "pass" | "fail";

export type Proof = {
  id: "health" | "smoke";
  label: string;
  state: ProofOutcome;
  detail: string;
  /** decision 2: every result names where it came from */
  source: MetricSource;
  at: string | null;
};

/* ---------------------------------------------------------------- releases */

export type Release = {
  version: string;
  env: EnvScope;
  deployedAt: string;
  approvedBy: string | null;
  /** true only when both proofs passed on its live url */
  verified: boolean;
  commit: string;
  note: string;
  current: boolean;
};

/* ----------------------------------------------------------------- metrics */
// Decision 2: a tile without a source and a window does not ship.

export type MetricSource = "provider API" | "platform probe" | "platform records";

export type Metric = {
  label: string;
  value: string;
  window?: string;
  source: MetricSource;
  /** true while the value comes from demo fixtures rather than a live probe */
  demo: boolean;
  tone?: "pass" | "fail" | "caution";
};

/* ---------------------------------------------------------------- feedback */
// C4 back to C1, the maintenance loop. Mirrors contracts/feedback.schema.json.

export type FeedbackItem = {
  kind: "dependency" | "runtime" | "security";
  summary: string;
  evidence: string;
  suggestedRequirement: string;
};

export type FeedbackReport = {
  reportId: string;
  projectId: string;
  generatedAt: string;
  items: FeedbackItem[];
};

/* -------------------------------------------------------- activity records */

export type ActivityEntry = {
  id: string;
  at: string;
  actor: string;
  actorKind: "human" | "agent" | "system";
  action: string;
  target: string;
  detail: string;
};
