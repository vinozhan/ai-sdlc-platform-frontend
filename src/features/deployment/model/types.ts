/** Deployment feature domain types */

export type StageId = "connect" | "dependencies" | "release" | "verify" | "live";
export type ProviderId = "github" | "vercel" | "render";
export type Environment = "preview" | "prod";

export type ProviderState = {
  id: ProviderId;
  label: string;
  connected: boolean;
  linkedName: string;
  note: string;
};

export type DependencyUpdate = {
  id: string;
  pkg: string;
  from: string;
  to: string;
  semver: "major" | "minor" | "patch";
  ruleScore: number;
  llmScore: number;
  fusedScore: number;
  changelog: string;
  affectedFunctions: number;
  impactedFiles: string[];
  migrationGuide: string;
};

export type PipelineStep = {
  id: string;
  name: string;
  status: "pending" | "running" | "success" | "failed";
  duration: string;
};

export type DeploymentRecord = {
  id: string;
  env: Environment;
  status: "queued" | "running" | "failed" | "verified" | "live";
  version: string;
  startedAt: string;
  previewUrl: string;
  productionUrl: string;
  steps: PipelineStep[];
  proofs: { health: boolean; smoke: boolean };
  approvedBy?: string;
};

export type ReleaseRecord = {
  version: string;
  when: string;
  approvedBy: string;
  verified: boolean;
  notes: string;
};

export type DeploymentMetrics = {
  uptime: { value: string; window: string };
  p95: { value: string; unit: string; window: string };
  errorRate: { value: string; window: string };
  instances: string;
  requestRateSparkline: number[];
};

export type DeploymentApi = {
  getProviders: () => Promise<ProviderState[]>;
  connectProvider: (providerId: ProviderId) => Promise<{ linkedProject: string }>;
  getDeployments: (env: Environment) => Promise<DeploymentRecord[]>;
  createDeployment: (env: Environment) => Promise<{ id: string }>;
  getDeployment: (id: string) => Promise<DeploymentRecord | null>;
  streamLogs: (id: string, onLine: (line: string) => void) => () => void;
  promote: (id: string) => Promise<{ ok: boolean; reason?: string }>;
  rollback: (toRelease: string) => Promise<{ ok: boolean }>;
  getReleases: () => Promise<ReleaseRecord[]>;
  getMetrics: (env: Environment, window: string) => Promise<DeploymentMetrics>;
};
