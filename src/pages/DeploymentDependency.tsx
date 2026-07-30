import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Activity,
  ArrowUpCircle,
  CheckCircle2,
  Clock3,
  FileCode2,
  GitBranch,
  History,
  Package,
  Play,
  RefreshCw,
  RotateCcw,
  Server,
  Shield,
  Sparkles,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Progress, Table, Td, Th } from "@/components/ui/primitives";
import { PhaseSectionHeader, getPhaseProgress } from "@/components/project/PhaseSectionHeader";
import { ChevronStepper } from "@/components/ui/ChevronStepper";
import { VSCodeEditor, type EditorTab } from "@/components/code/VSCodeEditor";
import { VSCodeFileTree } from "@/components/code/VSCodeFileTree";
import { useStore } from "@/store/useStore";
import { cn } from "@/utils/cn";

type StageId = "connect" | "dependencies" | "release" | "verify" | "live";
type ProviderId = "github" | "vercel" | "render";
type Environment = "preview" | "prod";

type ProviderState = {
  id: ProviderId;
  label: string;
  connected: boolean;
  linkedName: string;
  note: string;
};

type DependencyUpdate = {
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

type PipelineStep = {
  id: string;
  name: string;
  status: "pending" | "running" | "success" | "failed";
  duration: string;
};

type DeploymentRecord = {
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

type ReleaseRecord = {
  version: string;
  when: string;
  approvedBy: string;
  verified: boolean;
  notes: string;
};

type DeploymentMetrics = {
  uptime: { value: string; window: string };
  p95: { value: string; unit: string; window: string };
  errorRate: { value: string; window: string };
  instances: string;
  requestRateSparkline: number[];
};

type DeploymentApi = {
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

const deploymentSteps = [
  { id: "connect", label: "Connect" },
  { id: "dependencies", label: "Dependencies" },
  { id: "release", label: "Release" },
  { id: "verify", label: "Verify & approve" },
  { id: "live", label: "Live" },
];

const releaseFiles = [
  { path: ".github/workflows/deploy.yml", type: "workflow" },
  { path: "backend/Dockerfile", type: "docker" },
  { path: "frontend/vercel.json", type: "config" },
  { path: "render.yaml", type: "config" },
  { path: ".env.manifest", type: "env" },
] as const;

const releaseContents: Record<string, string> = {
  ".github/workflows/deploy.yml": `name: deploy
on:
  push:
    branches: [main]
jobs:
  build-test-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci --prefix frontend
      - run: npm ci --prefix backend
      - run: npm run build --prefix frontend
      - run: npm test --prefix backend
      - run: curl -X POST $RENDER_DEPLOY_HOOK_URL`,
  "backend/Dockerfile": `FROM eclipse-temurin:21-jre
WORKDIR /app
COPY build/libs/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s CMD wget -qO- http://localhost:8080/actuator/health
ENTRYPOINT ["java", "-jar", "app.jar"]`,
  "frontend/vercel.json": `{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/api/(.*)", "destination": "https://nexuspay-api.onrender.com/$1" }]
}`,
  "render.yaml": `services:
  - type: web
    name: nexuspay-api
    env: docker
    dockerfilePath: ./backend/Dockerfile
    healthCheckPath: /actuator/health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: nexuspay-db
          property: connectionString
      - key: CORS_ALLOWED_ORIGIN
        value: https://nexuspay-frontend.vercel.app
databases:
  - name: nexuspay-db
    databaseName: nexuspay`,
  ".env.manifest": "frontend:\n  VITE_API_URL=https://nexuspay-api.onrender.com\nbackend:\n  DATABASE_URL=${DATABASE_URL}\n  CORS_ALLOWED_ORIGIN=https://nexuspay-frontend.vercel.app",
};

const dependencyUpdatesSeed: DependencyUpdate[] = [
  {
    id: "du-1",
    pkg: "spring-boot-starter-web",
    from: "3.2.1",
    to: "3.3.0",
    semver: "minor",
    ruleScore: 28,
    llmScore: 32,
    fusedScore: 30,
    changelog: "Adds actuator endpoint improvements. No high risk API removals.",
    affectedFunctions: 2,
    impactedFiles: ["backend/src/main/java/com/pay/PaymentController.java", "backend/src/main/java/com/pay/AuthController.java"],
    migrationGuide: "Upgrade and run smoke tests.",
  },
  {
    id: "du-2",
    pkg: "jackson-databind",
    from: "2.16.0",
    to: "2.17.0",
    semver: "minor",
    ruleScore: 66,
    llmScore: 74,
    fusedScore: 70,
    changelog: "Deserializer behavior changed for polymorphic payloads.",
    affectedFunctions: 5,
    impactedFiles: ["backend/src/main/java/com/pay/PaymentDTO.java", "backend/src/main/java/com/pay/UserDTO.java"],
    migrationGuide: "Review @JsonTypeInfo usage and rerun contract tests.",
  },
  {
    id: "du-3",
    pkg: "spring-security-crypto",
    from: "6.2.1",
    to: "7.0.0",
    semver: "major",
    ruleScore: 86,
    llmScore: 91,
    fusedScore: 89,
    changelog: "Password encoder API changed. Namespace updates are required.",
    affectedFunctions: 8,
    impactedFiles: ["backend/src/main/java/com/pay/SecurityConfig.java", "backend/src/main/java/com/pay/UserService.java"],
    migrationGuide: "Run migration playbook, rotate password hashes, then reverify.",
  },
];

function asRisk(score: number): { label: "auto-apply" | "review" | "held"; badge: "success" | "warning" | "error" } {
  if (score < 30) return { label: "auto-apply", badge: "success" };
  if (score <= 70) return { label: "review", badge: "warning" };
  return { label: "held", badge: "error" };
}

function useEditorTabs(defaultPath: string) {
  const [tabs, setTabs] = useState<EditorTab[]>([{ path: defaultPath }]);
  const [activePath, setActivePath] = useState(defaultPath);

  const openFile = (path: string) => {
    setTabs((prev) => (prev.some((t) => t.path === path) ? prev : [...prev, { path }]));
    setActivePath(path);
  };

  const closeTab = (path: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.path !== path);
      if (next.length === 0) return prev;
      if (activePath === path) setActivePath(next[next.length - 1].path);
      return next;
    });
  };

  return { tabs, activePath, openFile, closeTab, setActivePath };
}

function useDeploymentApi(projectKey: string): DeploymentApi {
  // All mutable fixture data lives in a ref so it persists across renders
  // without triggering re-renders itself.
  const dbRef = useRef<{
    providers: ProviderState[];
    deployments: DeploymentRecord[];
    releases: ReleaseRecord[];
  } | null>(null);

  if (!dbRef.current) {
    dbRef.current = {
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

  // Stable API object: created once and never replaced, so it is safe to use
  // as a useEffect dependency without triggering infinite re-renders.
  const apiRef = useRef<DeploymentApi | null>(null);

  if (!apiRef.current) {
    const db = () => dbRef.current!;
    const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

    apiRef.current = {
      async getProviders() {
        await sleep(240);
        return db().providers;
      },
      async connectProvider(providerId) {
        db().providers = db().providers.map((p) =>
          p.id === providerId ? { ...p, connected: true } : p
        );
        await sleep(260);
        return { linkedProject: db().providers.find((p) => p.id === providerId)?.linkedName ?? providerId };
      },
      async getDeployments(env) {
        return db().deployments.filter((d) => d.env === env);
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
        db().deployments = [deployment, ...db().deployments];
        return { id: deployment.id };
      },
      async getDeployment(id) {
        return db().deployments.find((d) => d.id === id) ?? null;
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
          if (index >= lines.length) { window.clearInterval(timer); return; }
          onLine(lines[index]);
          index += 1;
        }, 550);
        return () => window.clearInterval(timer);
      },
      async promote(id) {
        const deployment = db().deployments.find((d) => d.id === id);
        if (!deployment) return { ok: false, reason: "Deployment not found." };
        if (!deployment.proofs.health || !deployment.proofs.smoke)
          return { ok: false, reason: "Health and smoke proofs must both pass before promotion." };
        deployment.status = "live";
        return { ok: true };
      },
      async rollback(toRelease) {
        return { ok: db().releases.some((r) => r.version === toRelease && r.verified) };
      },
      async getReleases() {
        return db().releases;
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

  return apiRef.current;
}

function StatusChip({ connected }: { connected: boolean }) {
  return (
    <Badge variant={connected ? "success" : "error"}>
      {connected ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {connected ? "Connected" : "Disconnected"}
    </Badge>
  );
}

export function DeploymentDependency() {
  const { projectId } = useParams();
  const { theme, projects, activeProjectId, addToast, settings } = useStore();
  const isDark = theme === "dark";
  const project = useMemo(
    () => projects.find((p) => p.id === (activeProjectId ?? projectId)),
    [projects, activeProjectId, projectId]
  );
  const demoMode = true;
  const api = useDeploymentApi(project?.id ?? "local");

  const initialStage: StageId =
    project?.status === "complete" || project?.status === "deploy" ? "live" : "connect";

  const [activeStage, setActiveStage] = useState<StageId>(initialStage);
  const [maxStage, setMaxStage] = useState<StageId>(initialStage);
  const [providers, setProviders] = useState<ProviderState[]>([]);
  const [selectedUpdateId, setSelectedUpdateId] = useState(dependencyUpdatesSeed[0].id);
  const [template, setTemplate] = useState<"single" | "layered" | "parallel">("layered");
  const [deployingId, setDeployingId] = useState<string | null>(null);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [proofs, setProofs] = useState(
    project?.status === "complete" || project?.status === "deploy"
      ? { health: true, smoke: true }
      : { health: false, smoke: false }
  );
  const [gateNote, setGateNote] = useState("");
  const [releases, setReleases] = useState<ReleaseRecord[]>([]);
  const [metrics, setMetrics] = useState<DeploymentMetrics | null>(null);
  const [pendingRollback, setPendingRollback] = useState<string | null>(null);

  const editor = useEditorTabs(releaseFiles[0].path);

  const selectedUpdate = dependencyUpdatesSeed.find((d) => d.id === selectedUpdateId) ?? dependencyUpdatesSeed[0];
  const providersReady = providers.every((p) => p.connected);
  const waitingForTesting = project ? !["deploy", "complete"].includes(project.status) : true;
  const stageBadges = {
    dependencies: dependencyUpdatesSeed.filter((d) => asRisk(d.fusedScore).label !== "auto-apply").length,
    verify: proofs.health && proofs.smoke ? undefined : 1,
  };

  useEffect(() => {
    api.getProviders().then(setProviders);
    api.getDeployments("preview").then(setDeployments);
    api.getReleases().then(setReleases);
    api.getMetrics("prod", "60m").then(setMetrics);
  }, [api]);

  useEffect(() => {
    if (!deployingId) return;
    const stop = api.streamLogs(deployingId, (line) => {
      setLogs((prev) => [...prev, line]);
      setDeployments((prev) =>
        prev.map((d) => {
          if (d.id !== deployingId) return d;
          const nextSteps = [...d.steps];
          if (line.includes("[smoke]")) {
            nextSteps[0] = { ...nextSteps[0], status: "success", duration: "52s" };
            nextSteps[1] = { ...nextSteps[1], status: "running", duration: "41s" };
          } else if (line.includes("[security]")) {
            nextSteps[1] = { ...nextSteps[1], status: "success", duration: "41s" };
            nextSteps[2] = { ...nextSteps[2], status: "running", duration: "38s" };
          } else if (line.includes("preview URL ready")) {
            nextSteps[2] = { ...nextSteps[2], status: "success", duration: "38s" };
            nextSteps[3] = { ...nextSteps[3], status: "success", duration: "36s" };
            d.status = "verified";
            setProofs({ health: true, smoke: true });
            addToast({ type: "success", title: "Preview verified", message: "Health and smoke proofs passed." });
          }
          return { ...d, steps: nextSteps };
        })
      );
    });
    return stop;
  }, [api, deployingId, addToast]);

  const startDeploy = async () => {
    const { id } = await api.createDeployment("preview");
    const record = await api.getDeployment(id);
    if (!record) return;
    setDeployments((prev) => [record, ...prev]);
    setDeployingId(id);
    setLogs([]);
    setProofs({ health: false, smoke: false });
    goToStage("release");
    addToast({ type: "info", title: "Preview deploy started", message: "Streaming logs are now live." });
  };

  const promote = async () => {
    if (!deployments[0]) return;
    const result = await api.promote(deployments[0].id);
    if (!result.ok) {
      addToast({ type: "error", title: "Promotion blocked", message: result.reason });
      return;
    }
    addToast({ type: "success", title: "Promoted to production", message: "Release is now live." });
    goToStage("live");
  };

  const requestChanges = () => {
    if (!gateNote.trim()) {
      addToast({ type: "warning", title: "Note required", message: "Add a reason before requesting changes." });
      return;
    }
    addToast({ type: "warning", title: "Changes requested", message: gateNote });
    setGateNote("");
  };

  const stageIndex: Record<StageId, number> = {
    connect: 1,
    dependencies: 2,
    release: 3,
    verify: 4,
    live: 5,
  };

  // Navigate to a stage and advance maxStage if going forward.
  const goToStage = (id: StageId) => {
    setActiveStage(id);
    setMaxStage((prev) => (stageIndex[id] > stageIndex[prev] ? id : prev));
  };

  // progressId drives which chevrons are unlocked. Always use the furthest
  // stage ever reached so previously visited steps stay clickable.
  const progressId: StageId = waitingForTesting ? "connect" : maxStage;

  // Progress bar = furthest reached stage out of 5.
  const phaseProgress = waitingForTesting
    ? 0
    : Math.round((stageIndex[maxStage] / 5) * 100);

  return (
    <div className="w-full space-y-5 p-4 sm:p-6 md:p-8">
      <PhaseSectionHeader
        title="Deployment"
        subtitle={
          waitingForTesting
            ? "Not started: waiting for the Testing gate."
            : "Connect providers, pre-flight dependencies, release, verify preview, and promote to production."
        }
        progress={phaseProgress}
        isDark={isDark}
        action={undefined}
      />

      <ChevronStepper
        steps={deploymentSteps.map((s) => ({ ...s, badge: stageBadges[s.id as keyof typeof stageBadges] }))}
        progressId={progressId}
        selectedId={activeStage}
        isDark={isDark}
        onStepClick={(id) => goToStage(id as StageId)}
      />

      {activeStage === "connect" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-orange-400" />
                Connected repositories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: "repo-1", name: "nexuspay-frontend", branch: "main", commit: "1f43a9e", state: "connected" },
                { id: "repo-2", name: "nexuspay-backend", branch: "main", commit: "4ba23bc", state: "connected" },
              ].map((repo) => (
                <div key={repo.id} className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{repo.name}</span>
                    <Badge variant="default">
                      <GitBranch className="h-3 w-3" />
                      {repo.branch}
                    </Badge>
                    <span className="text-xs text-slate-500">last commit {repo.commit}</span>
                    <div className="ml-auto">
                      <StatusChip connected={repo.state === "connected"} />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1 text-xs">
                    <Badge variant="default">React</Badge>
                    <Badge variant="default">TypeScript</Badge>
                    <Badge variant="default">Spring Boot</Badge>
                    <Badge variant="default">PostgreSQL</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-4 w-4 text-orange-400" />
                Providers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {providers.map((provider) => (
                <div key={provider.id} className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{provider.label}</p>
                      <p className="text-xs text-slate-500">{provider.linkedName}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{provider.note}</p>
                    </div>
                    <StatusChip connected={provider.connected} />
                  </div>
                  {!provider.connected && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={async () => {
                        await api.connectProvider(provider.id);
                        setProviders(await api.getProviders());
                      }}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              ))}

              <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                <p className="mb-2 text-xs font-semibold text-slate-400">Secrets</p>
                <div className="space-y-1 text-xs">
                  {["VERCEL_TOKEN", "RENDER_DEPLOY_HOOK_URL", "DATABASE_URL"].map((secret) => (
                    <div key={secret} className="flex items-center justify-between rounded bg-slate-900/60 px-2 py-1 dark:bg-slate-950">
                      <span className="font-mono text-slate-300">{secret}</span>
                      <span className="font-mono text-slate-500">********</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeStage === "dependencies" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-400" />
                Pre-flight updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dependencyUpdatesSeed.map((d) => {
                const risk = asRisk(d.fusedScore);
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedUpdateId(d.id)}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left",
                      selectedUpdateId === d.id ? "border-orange-500/40 bg-orange-500/5" : "border-slate-800 dark:border-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{d.pkg}</span>
                      <Badge variant={risk.badge}>{d.fusedScore}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {d.from} to {d.to}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant={d.semver === "major" ? "error" : d.semver === "minor" ? "warning" : "success"}>
                        {d.semver}
                      </Badge>
                      <Badge variant={risk.badge}>{risk.label}</Badge>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedUpdate.pkg}</CardTitle>
                <Badge variant={asRisk(selectedUpdate.fusedScore).badge}>{asRisk(selectedUpdate.fusedScore).label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-800 p-3 text-center dark:border-white/10">
                  <p className="text-xs text-slate-500">Rule-based</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedUpdate.ruleScore}</p>
                </div>
                <div className="rounded-xl border border-slate-800 p-3 text-center dark:border-white/10">
                  <p className="text-xs text-slate-500">LLM score</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedUpdate.llmScore}</p>
                </div>
                <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-3 text-center">
                  <p className="text-xs text-orange-300">Fused risk score</p>
                  <p className="text-xl font-bold text-orange-400">{selectedUpdate.fusedScore}</p>
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold text-slate-400">AI changelog summary</p>
                <p className="rounded-xl bg-slate-950 p-3 text-xs text-slate-300">{selectedUpdate.changelog}</p>
              </div>

              <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                <p className="mb-1 text-xs font-semibold text-slate-400">
                  Affected functions: {selectedUpdate.affectedFunctions}
                </p>
                {selectedUpdate.impactedFiles.length > 0 ? (
                  <div className="space-y-1">
                    {selectedUpdate.impactedFiles.map((file) => (
                      <p key={file} className="font-mono text-xs text-slate-300">
                        {file}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400">No impacted files detected.</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                <p className="mb-1 text-xs font-semibold text-slate-400">Migration guide</p>
                <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-300">{selectedUpdate.migrationGuide}</pre>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={selectedUpdate.fusedScore > 70 ? "error" : "c4"}
                  onClick={() => addToast({ type: "info", title: "Dependency decision", message: `${selectedUpdate.pkg} marked for apply.` })}
                >
                  <ArrowUpCircle className="h-3 w-3" />
                  Apply update
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addToast({ type: "warning", title: "Dependency held", message: `${selectedUpdate.pkg} held back.` })}
                >
                  <RotateCcw className="h-3 w-3" />
                  Revert
                </Button>
                <span title="Time to roll back to last verified release and rerun health and smoke proofs." className="ml-auto text-xs text-slate-500">
                  Estimated recovery: {selectedUpdate.fusedScore > 70 ? "42 min" : selectedUpdate.fusedScore >= 30 ? "18 min" : "8 min"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeStage === "release" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-orange-400" />
                  Release configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid h-auto grid-cols-1 gap-3 md:h-[440px] md:grid-cols-3">
                  <VSCodeFileTree
                    title="Explorer"
                    files={releaseFiles.map((f) => ({ path: f.path, type: f.type }))}
                    selectedPath={editor.activePath}
                    onSelect={editor.openFile}
                  />
                  <div className="min-h-[260px] md:col-span-2">
                    <VSCodeEditor
                      tabs={editor.tabs}
                      activePath={editor.activePath}
                      contents={releaseContents}
                      onSelectTab={editor.setActivePath}
                      onCloseTab={editor.closeTab}
                      copyable
                      showLanguage
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { id: "single", label: "single service", note: "One pipeline for full stack." },
                  { id: "layered", label: "per layer", note: "Frontend and backend split." },
                  { id: "parallel", label: "parallel", note: "Build and scan in parallel." },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTemplate(item.id as "single" | "layered" | "parallel")}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left",
                      template === item.id ? "border-orange-500/40 bg-orange-500/5" : "border-slate-800 dark:border-white/10"
                    )}
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.note}</p>
                  </button>
                ))}
                <Button
                  className="w-full"
                  variant="c4"
                  onClick={startDeploy}
                  disabled={!providersReady || waitingForTesting}
                >
                  <Play className="h-3 w-3" />
                  Start preview deploy
                </Button>
                {!providersReady && <p className="text-xs text-amber-400">Waiting on provider connections from Connect.</p>}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-400" />
                Pipeline execution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                {(deployments[0]?.steps ?? []).map((step) => (
                  <div key={step.id} className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{step.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{step.duration}</p>
                    <Badge
                      className="mt-2"
                      variant={
                        step.status === "success" ? "success" : step.status === "running" ? "warning" : step.status === "failed" ? "error" : "default"
                      }
                    >
                      {step.status}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300 dark:border-white/10">
                {logs.length === 0 ? (
                  <p className="text-slate-500">No deploy logs yet.</p>
                ) : (
                  logs.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeStage === "verify" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-400" />
              Preview proofs and promotion gate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
              <p className="text-xs text-slate-500">Preview URL</p>
              <p className="font-mono text-xs text-slate-900 dark:text-white">
                {deployments[0]?.previewUrl ?? "No preview deployment yet"}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 p-4 dark:border-white/10">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Health check proof</p>
                <p className="mt-1 text-xs text-slate-500">GET /actuator/health</p>
                <Badge className="mt-2" variant={proofs.health ? "success" : "warning"}>
                  {proofs.health ? "pass" : "running"}
                </Badge>
              </div>
              <div className="rounded-xl border border-slate-800 p-4 dark:border-white/10">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Smoke test proof</p>
                <p className="mt-1 text-xs text-slate-500">Core payment and auth smoke suite</p>
                <Badge className="mt-2" variant={proofs.smoke ? "success" : "warning"}>
                  {proofs.smoke ? "pass" : "running"}
                </Badge>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
              <p className="text-sm text-slate-900 dark:text-white">
                Verified deploy is green only when both proofs pass.
              </p>
              <Progress value={proofs.health && proofs.smoke ? 100 : 50} className="mt-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {activeStage === "live" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Environments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Preview - Vercel</p>
                    <Badge variant="success">verified</Badge>
                  </div>
                  <p className="mt-1 font-mono text-xs text-slate-500">{deployments[0]?.previewUrl}</p>
                </div>
                <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Production - Vercel + Render</p>
                    <Badge variant="success">live</Badge>
                  </div>
                  <p className="mt-1 font-mono text-xs text-slate-500">{deployments[0]?.productionUrl ?? "https://nexuspay.app"}</p>
                  <p className="mt-1 text-xs text-slate-500">Render backend is waking up when idle, first request can be slower.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Production metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                    <p className="text-xs text-slate-500">Uptime</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{metrics?.uptime.value}</p>
                    <p className="text-xs text-slate-500">{metrics?.uptime.window}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                    <p className="text-xs text-slate-500">p95 response</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {metrics?.p95.value}
                      {metrics?.p95.unit}
                    </p>
                    <p className="text-xs text-slate-500">{metrics?.p95.window}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                    <p className="text-xs text-slate-500">Error rate</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{metrics?.errorRate.value}</p>
                    <p className="text-xs text-slate-500">5xx over total, {metrics?.errorRate.window}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                    <p className="text-xs text-slate-500">Instances</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{metrics?.instances}</p>
                    <p className="text-xs text-slate-500">window: last 5 minutes</p>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                  <p className="text-xs text-slate-500">Requests per minute sparkline</p>
                  <div className="mt-2 flex items-end gap-1">
                    {(metrics?.requestRateSparkline ?? []).map((v, i) => (
                      <div key={`${v}-${i}`} className="w-3 rounded bg-blue-500/40" style={{ height: `${Math.max(10, v)}px` }} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4 text-orange-400" />
                Release history and rollback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <thead>
                  <tr>
                    <Th>Version</Th>
                    <Th>When</Th>
                    <Th>Approved by</Th>
                    <Th>Verified</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {releases.map((release) => (
                    <tr key={release.version}>
                      <Td className="font-mono">{release.version}</Td>
                      <Td>{release.when}</Td>
                      <Td>{release.approvedBy}</Td>
                      <Td>
                        <Badge variant={release.verified ? "success" : "warning"}>{release.verified ? "verified" : "pending"}</Badge>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPendingRollback(release.version)}
                          disabled={!release.verified}
                        >
                          Roll back
                        </Button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-400" />
                  Dependency watch timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { date: "2026-07-29 12:05", pkg: "jackson-databind", action: "held", score: 70 },
                  { date: "2026-07-28 16:22", pkg: "spring-boot-starter-web", action: "scheduled", score: 30 },
                  { date: "2026-07-27 10:12", pkg: "tomcat-embed-core", action: "applied", score: 12 },
                ].map((item) => (
                  <div key={`${item.pkg}-${item.date}`} className="flex items-center justify-between rounded-xl border border-slate-800 p-3 dark:border-white/10">
                    <div>
                      <p className="text-xs font-medium text-slate-900 dark:text-white">{item.pkg}</p>
                      <p className="text-[11px] text-slate-500">{item.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.action === "applied" ? "success" : item.action === "scheduled" ? "warning" : "error"}>
                        {item.action}
                      </Badge>
                      <Badge variant="default">{item.score}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-400" />
                  AI parsed release notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {releases.map((release) => (
                  <div key={`${release.version}-note`} className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-xs text-slate-900 dark:text-white">{release.version}</p>
                      <p className="text-[11px] text-slate-500">{release.when}</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{release.notes}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Suggested requirement follow-up created.</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeStage !== "verify" && !waitingForTesting && !(proofs.health && proofs.smoke) && (
        <Card>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2 text-sm">
              <TriangleAlert className="h-4 w-4 text-amber-400" />
              <span className="text-slate-300">Verify stage is waiting on both proofs.</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => goToStage("verify")}>
              Open verify stage
            </Button>
          </CardContent>
        </Card>
      )}

      {activeStage === "verify" && (
        <div className="sticky bottom-0 z-20 rounded-2xl border border-slate-800 bg-[#0f1d32] p-4 shadow-2xl dark:border-white/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Promotion gate</p>
              <p className="text-xs text-slate-400">
                Promote is enabled only when health and smoke are both green.
              </p>
            </div>
            <input
              value={gateNote}
              onChange={(e) => setGateNote(e.target.value)}
              placeholder="Request changes note"
              className="h-9 w-full rounded-lg border border-white/10 bg-[#081321] px-3 text-sm text-slate-200 outline-none sm:w-72"
            />
            <Button variant="outline" size="sm" onClick={requestChanges}>
              Request changes
            </Button>
            <Button variant="c4" size="sm" onClick={promote} disabled={!(proofs.health && proofs.smoke)}>
              Promote to production
            </Button>
          </div>
        </div>
      )}

      {pendingRollback && (
        <Card className="border-red-500/30">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
              <Clock3 className="h-4 w-4 text-red-400" />
              <span className="text-slate-900 dark:text-white">Confirm roll back to verified release {pendingRollback}.</span>
            </div>
            <Button
              size="sm"
              variant="error"
              onClick={async () => {
                const res = await api.rollback(pendingRollback);
                addToast({
                  type: res.ok ? "warning" : "error",
                  title: res.ok ? "Rollback started" : "Rollback failed",
                  message: res.ok ? `Returning to ${pendingRollback}.` : "Target release is not verified.",
                });
                setPendingRollback(null);
              }}
            >
              Confirm roll back
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPendingRollback(null)}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {waitingForTesting && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-900 dark:text-white">Not started: waiting for the Testing gate.</p>
            <p className="mt-1 text-xs text-slate-500">
              This project can start deployment only after Testing and Security are approved.
            </p>
          </CardContent>
        </Card>
      )}

      {activeStage === "live" && metrics && Number.parseFloat(metrics.errorRate.value) > 0.25 && (
        <Card className="border-amber-500/30">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-white">
              <TriangleAlert className="h-4 w-4 text-amber-400" />
              Degraded state detected. Suggest roll back to {releases[0]?.version}.
            </div>
            <Button size="sm" variant="outline" onClick={() => setPendingRollback(releases[0]?.version ?? null)}>
              Suggest rollback
            </Button>
          </CardContent>
        </Card>
      )}

      {activeStage === "release" && deployments[0]?.status === "failed" && (
        <Card className="border-red-500/30">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-red-300">Deploy failed at step: {deployments[0].steps.find((s) => s.status === "failed")?.name}</p>
              <p className="text-xs text-slate-400">Log excerpt: failed to validate CORS wiring against production domain.</p>
            </div>
            <Button size="sm" variant="outline" onClick={startDeploy}>
              <RefreshCw className="h-3 w-3" />
              Retry step
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
