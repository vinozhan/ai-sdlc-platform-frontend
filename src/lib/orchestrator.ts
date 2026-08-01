// The one front door.
//
// Decision 1: the browser talks only to the orchestrator. Every function here
// names the route it will call once the orchestrator exists; today a fixture
// answers behind it. Nothing in the UI knows which is the case, so the swap is
// replacing the bodies below with fetch calls, not touching a screen.
//
// The scenario switch is a fixtures-layer concern on purpose: no function takes
// a scenario argument, because the real API will not have one.

import type {
  ActivityEntry,
  Binding,
  Connection,
  ConnectionOption,
  DeployPlan,
  Deployment,
  EnvValue,
  FeedbackReport,
  Metric,
  Proof,
  Release,
} from "@/types/platform";
import {
  DEMO_NOW,
  bindingsByProject,
  compensationLog,
  connections as connectionFixtures,
  deployLog,
  deployPlans,
  deploymentActivity,
  degradedMetrics,
  envValuesByProject,
  failedDeployment,
  feedbackReport,
  liveDeployment,
  liveMetrics,
  proofsPassing,
  proofsRunning,
  releases as releaseFixtures,
  type LogLine,
} from "@/data/platformData";

/* ------------------------------------------------------------- demo control */

export type Scenario =
  | "live"
  | "never-deployed"
  | "deploying"
  | "proofs-running"
  | "provisioning-failure"
  | "degraded"
  | "disconnected";

export const scenarioLabels: Record<Scenario, string> = {
  live: "Live and healthy",
  "never-deployed": "Never deployed",
  deploying: "Deploying",
  "proofs-running": "Proofs running",
  "provisioning-failure": "Provisioning failure",
  degraded: "Degraded",
  disconnected: "Provider disconnected",
};

let scenario: Scenario = "live";
const listeners = new Set<(s: Scenario) => void>();

export function getScenario() {
  return scenario;
}

export function setScenario(next: Scenario) {
  scenario = next;
  listeners.forEach((l) => l(next));
}

export function onScenarioChange(listener: (s: Scenario) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Everything in this pass is fixture material. The badge says so in the UI. */
export const DEMO_MODE = true;

const settle = <T,>(value: T, ms = 220): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/* ------------------------------------------------------------- connections */
//
// Connections are the one thing on this page a person changes, so the fixtures
// layer keeps them in memory for the session the way the server would keep them
// for good. Every call reads and writes this copy, which is why connecting in
// Settings shows up in the Deployment phase without a reload.

const clone = (list: Connection[]) => list.map((c) => ({ ...c, options: c.options.map((o) => ({ ...o })) }));

let connectionState: Connection[] = clone(connectionFixtures);

/** A scenario describes a different workspace, so it starts from the fixtures again. */
function resetConnections() {
  connectionState = clone(connectionFixtures);
  if (scenario === "disconnected") {
    connectionState = connectionState.map((c) =>
      c.provider === "vercel"
        ? { ...c, status: "not-connected" as const, account: null, lastUsed: null, expiredNote: undefined }
        : c
    );
  }
}

onScenarioChange(resetConnections);
resetConnections();

const readConnection = (provider: string) => connectionState.find((c) => c.provider === provider)!;

function writeConnection(next: Connection) {
  connectionState = connectionState.map((c) => (c.provider === next.provider ? next : c));
  return next;
}

/** GET /connections */
export async function getConnections(): Promise<Connection[]> {
  return settle(clone(connectionState));
}

/**
 * POST /connections/:provider/authorize
 *
 * Starts the provider's own consent flow and returns where to send the person.
 * Approval happens at the provider, which is the point: the credential is
 * created there, handed to the platform, and never passes through this browser.
 */
export async function beginAuthorization(
  provider: string,
  accountId: string
): Promise<{ url: string; account: string }> {
  const found = readConnection(provider);
  const account = found.availableAccounts.find((a) => a.id === accountId) ?? found.availableAccounts[0];
  return settle({ url: `https://${provider}.example/authorize?account=${account.id}`, account: account.label }, 500);
}

/**
 * POST /connections/:provider/connect
 *
 * Called once the provider redirects back. The account is what the person chose
 * during consent; the credential itself is already sealed on the server.
 */
export async function connectProvider(provider: string, accountId?: string): Promise<Connection> {
  const found = readConnection(provider);
  const account =
    found.availableAccounts.find((a) => a.id === accountId)?.label ?? found.account ?? "acme-labs";
  return settle(
    writeConnection({
      ...found,
      status: "connected",
      account,
      lastUsed: DEMO_NOW,
      expiredNote: undefined,
      // the account you chose is the one new resources are created in
      options: found.options.map((o) =>
        o.key === "defaultOrg" || o.key === "team" ? { ...o, value: account } : o
      ),
    }),
    600
  );
}

/** POST /connections/:provider/rotate  (same consent flow, new credential) */
export async function rotateProvider(provider: string, accountId?: string): Promise<Connection> {
  const found = readConnection(provider);
  const account =
    found.availableAccounts.find((a) => a.id === accountId)?.label ?? found.account ?? "acme-labs";
  return settle(
    writeConnection({ ...found, status: "connected", account, lastUsed: DEMO_NOW, expiredNote: undefined }),
    500
  );
}

/** DELETE /connections/:provider */
export async function disconnectProvider(provider: string): Promise<Connection> {
  const found = readConnection(provider);
  return settle(
    writeConnection({ ...found, status: "not-connected", account: null, lastUsed: null, expiredNote: undefined }),
    400
  );
}

/** PATCH /connections/:provider/options */
export async function updateConnectionOptions(
  provider: string,
  options: ConnectionOption[]
): Promise<Connection> {
  const found = readConnection(provider);
  return settle(writeConnection({ ...found, options: options.map((o) => ({ ...o })) }), 400);
}

/* ---------------------------------------------------------------- bindings */

/** GET /projects/:id/bindings */
export async function getBindings(projectId: string): Promise<Binding[]> {
  const bindings = bindingsByProject[projectId] ?? [];
  if (scenario === "never-deployed") {
    return settle(bindings.filter((b) => b.kind === "repository"));
  }
  if (scenario === "provisioning-failure") {
    // the run failed and compensated, so the cloud bindings are gone again
    return settle(bindings.filter((b) => b.kind === "repository" || b.kind === "database"));
  }
  return settle(bindings);
}

/** GET /projects/:id/env-values */
export async function getEnvValues(projectId: string): Promise<EnvValue[]> {
  return settle(envValuesByProject[projectId] ?? []);
}

/** PUT /projects/:id/env-values/:name */
export async function updateEnvValue(_projectId: string, name: string): Promise<{ name: string; at: string }> {
  return settle({ name, at: "2025-01-22 09:41" }, 300);
}

/* ------------------------------------------------------------- deploy plan */

/** GET /projects/:id/deploy-plan  (the artefact C4 produces) */
export async function getDeployPlan(projectId: string): Promise<DeployPlan | null> {
  return settle(deployPlans[projectId] ?? null);
}

/* ------------------------------------------------------------- deployments */

/**
 * The run each scenario is describing. The default is a preview build that has
 * finished and is waiting on the promotion decision, which is why production can
 * be serving a verified release at the same time.
 */
function currentDeployment(): Deployment {
  if (scenario === "provisioning-failure") return failedDeployment;

  if (scenario === "deploying") {
    return {
      ...liveDeployment,
      status: "building",
      previewUrl: null,
      finishedAt: null,
      steps: liveDeployment.steps.map((step, i) =>
        i === 0
          ? { ...step, state: "running" as const, duration: undefined, detail: "frontend and backend, in parallel" }
          : { ...step, state: "pending" as const, duration: undefined, detail: undefined }
      ),
    };
  }

  if (scenario === "proofs-running") {
    return {
      ...liveDeployment,
      status: "verifying",
      finishedAt: null,
      steps: liveDeployment.steps.map((step) =>
        step.id === "smoke" ? { ...step, state: "running", duration: undefined, detail: "11 of 18 tests run" } : step
      ),
    };
  }

  return liveDeployment;
}

/** GET /deployments?project=&env= */
export async function getDeployments(projectId: string): Promise<Deployment[]> {
  if (scenario === "never-deployed") return settle([]);
  return settle([currentDeployment()].filter((d) => d.projectId === projectId));
}

/** POST /deployments  with an idempotency key */
export async function startDeployment(projectId: string, env: "preview" | "production"): Promise<Deployment> {
  const base = currentDeployment();
  return settle({ ...base, projectId, env, status: "provisioning", steps: base.steps.map((s) => ({ ...s, state: "pending" as const })) }, 300);
}

/** GET /deployments/:id */
export async function getDeployment(_id: string): Promise<Deployment> {
  return settle(currentDeployment());
}

/**
 * GET /deployments/:id/logs  (SSE in the real thing)
 *
 * Returns an unsubscribe function. The real stream carries a cursor so a
 * dropped connection resumes without losing lines; the fixture simply replays.
 */
export function streamDeploymentLogs(
  _id: string,
  onLine: (line: LogLine, index: number) => void,
  onDone?: () => void
): () => void {
  const script = scenario === "provisioning-failure" ? compensationLog : deployLog;
  let index = 0;
  const timer = window.setInterval(() => {
    if (index >= script.length) {
      window.clearInterval(timer);
      onDone?.();
      return;
    }
    onLine(script[index], index);
    index += 1;
  }, 420);
  return () => window.clearInterval(timer);
}

/** GET /deployments/:id/proofs */
export async function getProofs(_id: string): Promise<Proof[]> {
  if (scenario === "proofs-running") return settle(proofsRunning);
  if (scenario === "provisioning-failure" || scenario === "never-deployed") return settle([]);
  return settle(proofsPassing);
}

/** POST /deployments/:id/promote  (recorded by the orchestrator's single gate) */
export async function promoteDeployment(_id: string): Promise<Release> {
  return settle(
    {
      version: "v1.5.0",
      env: "production" as const,
      deployedAt: "2025-01-22 09:44",
      approvedBy: "Alex Chen",
      verified: true,
      commit: "8f2c41a",
      note: "Refund endpoint returns the refund id",
      current: true,
    },
    700
  );
}

/* ---------------------------------------------------- releases and rollback */

/** GET /projects/:id/releases */
export async function getReleases(projectId: string): Promise<Release[]> {
  if (scenario === "never-deployed" || !bindingsByProject[projectId]) return settle([]);
  return settle(projectId === "p1" ? releaseFixtures : []);
}

/** POST /projects/:id/rollback  (application only, migrations are forward only) */
export async function rollback(_projectId: string, toVersion: string): Promise<Release> {
  const target = releaseFixtures.find((r) => r.version === toVersion)!;
  return settle({ ...target, current: true }, 800);
}

/* ----------------------------------------------------------------- metrics */

/** GET /metrics?project=&env=&window= */
export async function getMetrics(projectId: string): Promise<Metric[]> {
  if (scenario === "never-deployed" || projectId !== "p1") return settle([]);
  if (scenario === "degraded") return settle(degradedMetrics);
  return settle(liveMetrics);
}

/* --------------------------------------------------------- audit and loop */

/** GET /audit?project= */
export async function getActivity(projectId: string): Promise<ActivityEntry[]> {
  return settle(projectId === "p1" ? deploymentActivity : []);
}

/** GET /projects/:id/feedback  (C4 back to C1) */
export async function getFeedback(_projectId: string): Promise<FeedbackReport> {
  return settle(feedbackReport);
}
