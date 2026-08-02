import type {
  DeploymentApi,
  DeploymentRecord,
  ProviderState,
  ReleaseRecord,
} from "../model/types";
import { createApiSeed } from "../fixtures/apiSeed";

type DeploymentDb = {
  providers: ProviderState[];
  deployments: DeploymentRecord[];
  releases: ReleaseRecord[];
};

/** Fixture-backed deployment API. Swap for `lib/http` calls when C4 is live. */
export function createDeploymentApi(projectKey: string, db: DeploymentDb): DeploymentApi {
  const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

  return {
    async getProviders() {
      await sleep(240);
      return db.providers;
    },
    async connectProvider(providerId) {
      db.providers = db.providers.map((p) =>
        p.id === providerId ? { ...p, connected: true } : p
      );
      await sleep(260);
      return { linkedProject: db.providers.find((p) => p.id === providerId)?.linkedName ?? providerId };
    },
    async getDeployments(env) {
      return db.deployments.filter((d) => d.env === env);
    },
    async createDeployment(env) {
      const deployment: DeploymentRecord = {
        id: `dep-${projectKey}-${Date.now()}`,
        env,
        status: "running",
        version: "v2.4.1",
        startedAt: "2026-07-29 13:38",
        previewUrl: "https://nexuspay-frontend-git-main.vercel.app",
        productionUrl: "https://nexuspay.app",
        proofs: { health: false, smoke: false },
        steps: [
          { id: "build", name: "Build", status: "running", duration: "0s" },
          { id: "smoke", name: "Smoke re-check", status: "pending", duration: "-" },
          { id: "security", name: "Security scan", status: "pending", duration: "-" },
          { id: "deploy", name: "Deploy", status: "pending", duration: "-" },
        ],
      };
      db.deployments = [deployment, ...db.deployments];
      return { id: deployment.id };
    },
    async getDeployment(id) {
      return db.deployments.find((d) => d.id === id) ?? null;
    },
    streamLogs(_id, onLine) {
      const lines = [
        "[deploy] Starting release v2.4.1",
        "[build] frontend build command: npm run build",
        "[build] backend image built from backend/Dockerfile",
        "[smoke] /actuator/health returned 200",
        "[security] dependency and image scan clean",
        "[deploy] pushing preview to Vercel and Render",
        "[deploy] preview URL ready: https://nexuspay-frontend-git-main.vercel.app",
      ];
      let index = 0;
      const timer = window.setInterval(() => {
        if (index >= lines.length) {
          window.clearInterval(timer);
          return;
        }
        onLine(lines[index]);
        index += 1;
      }, 550);
      return () => window.clearInterval(timer);
    },
    async promote(id) {
      const deployment = db.deployments.find((d) => d.id === id);
      if (!deployment) return { ok: false, reason: "Deployment not found." };
      if (!deployment.proofs.health || !deployment.proofs.smoke)
        return { ok: false, reason: "Health and smoke proofs must both pass before promotion." };
      deployment.status = "live";
      return { ok: true };
    },
    async rollback(toRelease) {
      return { ok: db.releases.some((r) => r.version === toRelease && r.verified) };
    },
    async getReleases() {
      return db.releases;
    },
    async getMetrics() {
      return {
        uptime: { value: "99.97%", window: "last 30 days" },
        p95: { value: "148", unit: "ms", window: "last 60 minutes" },
        errorRate: { value: "0.18%", window: "last 60 minutes" },
        instances: "3/3 running",
        requestRateSparkline: [48, 56, 52, 70, 64, 68, 60, 72],
      };
    },
  };
}

export function createDeploymentDb(projectKey: string): DeploymentDb {
  return createApiSeed(projectKey);
}
