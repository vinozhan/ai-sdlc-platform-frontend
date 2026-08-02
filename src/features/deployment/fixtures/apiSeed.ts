import type { DeploymentRecord, ProviderState, ReleaseRecord } from "../model/types";

export function createApiSeed(projectKey: string): {
  providers: ProviderState[];
  deployments: DeploymentRecord[];
  releases: ReleaseRecord[];
} {
  return {
      providers: [
        { id: "github", label: "GitHub", connected: true, linkedName: "acme-labs/nexuspay", note: "main branch linked" },
        { id: "vercel", label: "Vercel", connected: true, linkedName: "nexuspay-frontend", note: "preview and production domains configured" },
        { id: "render", label: "Render", connected: true, linkedName: "nexuspay-api + nexuspay-db", note: "health check /actuator/health" },
      ],
      deployments: [
        {
          id: `dep-${projectKey}-1`,
          env: "preview",
          status: "verified",
          version: "v2.4.0",
          startedAt: "2026-07-29 11:20",
          previewUrl: "https://nexuspay-frontend-git-main.vercel.app",
          productionUrl: "https://nexuspay.app",
          proofs: { health: true, smoke: true },
          approvedBy: "Alex Chen",
          steps: [
            { id: "build", name: "Build", status: "success", duration: "52s" },
            { id: "smoke", name: "Smoke re-check", status: "success", duration: "41s" },
            { id: "security", name: "Security scan", status: "success", duration: "38s" },
            { id: "deploy", name: "Deploy", status: "success", duration: "36s" },
          ],
        },
      ],
      releases: [
        { version: "v2.4.0", when: "2026-07-29 11:44", approvedBy: "Alex Chen", verified: true, notes: "Refund API update and KYC retries." },
        { version: "v2.3.1", when: "2026-07-26 09:16", approvedBy: "A. Chen", verified: true, notes: "Security patch and dependency hardening." },
        { version: "v2.3.0", when: "2026-07-20 13:22", approvedBy: "A. Chen", verified: true, notes: "Checkout UX improvements." },
      ],
    };
}
