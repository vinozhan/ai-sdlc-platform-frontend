// Demo data for the integrations flow and the Deployment phase.
//
// One coherent story on the timeline the Testing phase already uses (Sprint 24,
// build 1852, 21 Jan 2025):
//   - the workspace has GitHub, Vercel and Neon connected, and Render expired
//   - NexusPay is fully bound and live
//   - NotifyHub is mid provisioning
//   - ShopFlow and MediTrack have no bindings, they have not passed Testing
//
// Every value here is fixture material. Nothing in this file is a real token,
// and no real provider is contacted anywhere in the app.

import type { FileEntry } from "@/components/code/buildFileTree";
import type {
  ActivityEntry,
  Binding,
  Connection,
  DeployPlan,
  Deployment,
  EnvValue,
  FeedbackReport,
  Metric,
  Proof,
  Release,
} from "@/types/platform";

export const DEMO_NOW = "2025-01-22 09:41";

/* ----------------------------------------------------------- connections */

export const connections: Connection[] = [
  {
    provider: "github",
    name: "GitHub",
    purpose: "Creates the project repository and pushes generated code",
    status: "connected",
    account: "acme-labs",
    scopes: ["Create repositories", "Push code", "Write workflow files"],
    limits: [
      "Cannot read repositories it did not create",
      "Cannot change organisation members or settings",
    ],
    availableAccounts: [
      { id: "acme-labs", label: "acme-labs", kind: "organisation", note: "12 members, 34 repositories" },
      { id: "alex-chen", label: "alex-chen", kind: "personal" },
    ],
    options: [
      {
        key: "defaultOrg",
        label: "Create repositories in",
        value: "acme-labs",
        help: "Where a new project repository is created",
        choices: ["acme-labs", "alex-chen"],
      },
      {
        key: "visibility",
        label: "New repositories are",
        value: "Private",
        help: "Generated code starts private unless you say otherwise",
        choices: ["Private", "Public"],
      },
      {
        key: "defaultBranch",
        label: "Default branch",
        value: "main",
        help: "The branch the platform pushes to and deploys from",
      },
    ],
    lastUsed: "2025-01-21 15:31",
    usedByProjects: ["p1", "p4"],
  },
  {
    provider: "vercel",
    name: "Vercel",
    purpose: "Hosts the frontend and builds preview deployments",
    status: "connected",
    account: "acme-labs",
    scopes: ["Create projects", "Deploy", "Read build logs"],
    limits: ["Cannot touch projects created outside this platform", "Cannot change billing"],
    availableAccounts: [
      { id: "acme-labs", label: "acme-labs", kind: "organisation", note: "Pro team" },
      { id: "alex-chen", label: "alex-chen", kind: "personal", note: "Hobby, 1 concurrent build" },
    ],
    options: [
      {
        key: "team",
        label: "Create projects in",
        value: "acme-labs",
        help: "The team new frontend projects belong to",
        choices: ["acme-labs", "alex-chen"],
      },
      {
        key: "previewBuilds",
        label: "Build a preview for",
        value: "Every push to a pull request",
        help: "What triggers a preview deployment",
        choices: ["Every push to a pull request", "Only when Deployment asks"],
      },
    ],
    lastUsed: "2025-01-22 09:34",
    usedByProjects: ["p1", "p4"],
  },
  {
    provider: "render",
    name: "Render",
    purpose: "Runs the backend service from the repository blueprint",
    status: "expired",
    account: "acme-labs",
    scopes: ["Create services", "Trigger deploys", "Read logs"],
    limits: ["Cannot change the payment method", "Cannot delete services it did not create"],
    availableAccounts: [
      { id: "acme-labs", label: "acme-labs", kind: "organisation" },
      { id: "alex-chen", label: "alex-chen", kind: "personal" },
    ],
    options: [
      {
        key: "region",
        label: "Run services in",
        value: "Frankfurt",
        help: "Put this near the database region to keep queries fast",
        choices: ["Frankfurt", "Oregon", "Ohio", "Singapore"],
      },
      {
        key: "plan",
        label: "Instance size",
        value: "Free",
        help: "Free instances sleep after 15 minutes of no traffic, so the first request after that is slow",
        choices: ["Free", "Starter"],
      },
    ],
    lastUsed: "2025-01-18 09:12",
    usedByProjects: ["p1", "p4"],
    expiredNote: "The API key expired on 20 Jan. Reconnect to resume deploys. Bindings are kept.",
  },
  {
    provider: "neon",
    name: "Neon Postgres",
    purpose: "Provides the database, with a branch per preview deployment",
    status: "connected",
    account: "acme-labs",
    scopes: ["Create projects", "Create branches", "Read connection strings"],
    limits: ["Cannot read table data", "Cannot delete a project that holds a binding"],
    availableAccounts: [
      { id: "acme-labs", label: "acme-labs", kind: "organisation" },
      { id: "alex-chen", label: "alex-chen", kind: "personal", note: "Free plan, 10 branches" },
    ],
    options: [
      {
        key: "region",
        label: "Create databases in",
        value: "Frankfurt",
        help: "Match this to the Render region so the backend is not talking across continents",
        choices: ["Frankfurt", "Oregon", "Singapore"],
      },
      {
        key: "version",
        label: "Postgres version",
        value: "16",
        help: "Used for new databases only",
        choices: ["16", "15"],
      },
      {
        key: "branchPerPreview",
        label: "Preview deployments get",
        value: "Their own branch",
        help: "A branch keeps preview writes away from production data",
        choices: ["Their own branch", "The production database"],
      },
    ],
    lastUsed: "2025-01-22 09:33",
    usedByProjects: ["p1", "p4"],
  },
  {
    provider: "atlas",
    name: "MongoDB Atlas",
    purpose: "Provides the database for projects on the MERN track",
    status: "not-connected",
    account: null,
    scopes: ["Create clusters", "Manage database users", "Set IP allow lists"],
    limits: ["Cannot read documents", "Cannot change organisation billing"],
    availableAccounts: [
      { id: "acme-labs", label: "acme-labs", kind: "organisation" },
      { id: "alex-chen", label: "alex-chen", kind: "personal" },
    ],
    options: [
      {
        key: "region",
        label: "Create clusters in",
        value: "Frankfurt",
        help: "Match this to the region the backend runs in",
        choices: ["Frankfurt", "Oregon", "Singapore"],
      },
      {
        key: "tier",
        label: "Cluster tier",
        value: "M0 free",
        help: "M0 is shared and has no backups, which is fine for a demo project",
        choices: ["M0 free", "M10"],
      },
    ],
    lastUsed: null,
    usedByProjects: [],
  },
];

/* -------------------------------------------------------------- bindings */

export const bindingsByProject: Record<string, Binding[]> = {
  p1: [
    {
      kind: "repository",
      provider: "github",
      resourceName: "acme-labs/nexuspay",
      detail: "Branch main, 214 files, last push 21 Jan 15:31",
      url: "https://github.com/acme-labs/nexuspay",
      status: "bound",
      bornIn: "Code Generation",
    },
    {
      kind: "frontend",
      provider: "vercel",
      resourceName: "nexuspay",
      detail: "Root frontend/, Vite preset, production domain nexuspay.vercel.app",
      url: "https://vercel.com/acme-labs/nexuspay",
      status: "bound",
      bornIn: "Deployment",
    },
    {
      kind: "backend",
      provider: "render",
      resourceName: "nexuspay-api",
      detail: "From render.yaml, root backend/, health check /actuator/health",
      url: "https://dashboard.render.com/web/nexuspay-api",
      status: "bound",
      bornIn: "Deployment",
    },
    {
      kind: "database",
      provider: "neon",
      resourceName: "nexuspay-db",
      detail: "Postgres 16, branch main, a new branch per preview deploy",
      url: "https://console.neon.tech/app/projects/nexuspay-db",
      status: "bound",
      bornIn: "Deployment",
    },
  ],
  p4: [
    {
      kind: "repository",
      provider: "github",
      resourceName: "acme-labs/notifyhub",
      detail: "Branch main, 96 files, last push 22 Jan 09:12",
      url: "https://github.com/acme-labs/notifyhub",
      status: "bound",
      bornIn: "Code Generation",
    },
    {
      kind: "database",
      provider: "neon",
      resourceName: "notifyhub-db",
      detail: "Postgres 16, created 22 Jan 09:33",
      url: "https://console.neon.tech/app/projects/notifyhub-db",
      status: "bound",
      bornIn: "Deployment",
    },
    {
      kind: "backend",
      provider: "render",
      resourceName: "notifyhub-api",
      detail: "Creating the service from render.yaml",
      url: null,
      status: "provisioning",
      bornIn: "Deployment",
    },
    {
      kind: "frontend",
      provider: "vercel",
      resourceName: "notifyhub",
      detail: "Waiting for the backend URL before the project is created",
      url: null,
      status: "not-created",
      bornIn: "Deployment",
    },
  ],
};

/* ---------------------------------------------------- environment values */

export const envValuesByProject: Record<string, EnvValue[]> = {
  p1: [
    {
      name: "DATABASE_URL",
      preview: "postgres://nexuspay:****@ep-preview-4821.eu-central-1.aws.neon.tech/nexuspay",
      production: "postgres://nexuspay:****@ep-main-1907.eu-central-1.aws.neon.tech/nexuspay",
      setBy: "deployment",
      pointsAt: "the Neon branch for this environment",
      secret: true,
    },
    {
      name: "VITE_API_URL",
      preview: "https://nexuspay-api.onrender.com",
      production: "https://nexuspay-api.onrender.com",
      setBy: "deployment",
      pointsAt: "the Render service",
      secret: false,
    },
    {
      name: "CORS_ALLOWED_ORIGINS",
      preview: "https://nexuspay-git-preview-acme-labs.vercel.app",
      production: "https://nexuspay.vercel.app",
      setBy: "deployment",
      pointsAt: "the Vercel domain for this environment",
      secret: false,
    },
    {
      name: "JWT_SIGNING_KEY",
      preview: "****",
      production: "****",
      setBy: "you",
      secret: true,
    },
    {
      name: "STRIPE_WEBHOOK_SECRET",
      preview: "****",
      production: "****",
      setBy: "you",
      secret: true,
    },
  ],
};

/* ------------------------------------------------------------ deploy plan */

export const deployPlans: Record<string, DeployPlan> = {
  p1: {
    planId: "plan-1852-03",
    projectId: "p1",
    generatedBy: "Deployment planner",
    generatedAt: "2025-01-22 09:28",
    stack: "spring-boot",
    targets: [
      {
        role: "database",
        provider: "neon",
        resource: "nexuspay-db",
        note: "A branch is created for each preview so preview never writes to production data",
      },
      {
        role: "backend",
        provider: "render",
        resource: "nexuspay-api",
        rootDir: "backend/",
        runtime: "Java 21, Docker",
        note: "Defined by render.yaml in the repository",
      },
      {
        role: "frontend",
        provider: "vercel",
        resource: "nexuspay",
        rootDir: "frontend/",
        runtime: "Vite static build",
      },
    ],
    steps: [
      {
        id: "provision-db",
        label: "Create the database branch",
        dependsOn: null,
        compensation: "Delete the branch",
      },
      {
        id: "provision-backend",
        label: "Create the backend service with DATABASE_URL",
        dependsOn: "provision-db",
        compensation: "Delete the service",
      },
      {
        id: "provision-frontend",
        label: "Create the frontend project with VITE_API_URL",
        dependsOn: "provision-backend",
        compensation: "Delete the project",
      },
      { id: "build", label: "Build both applications", dependsOn: "provision-frontend", compensation: null },
      { id: "deploy", label: "Deploy to the preview environment", dependsOn: "build", compensation: null },
    ],
    wiring: [
      { name: "VITE_API_URL", from: "the frontend", to: "the Render service URL" },
      { name: "DATABASE_URL", from: "the backend", to: "the Neon branch for this environment" },
      { name: "CORS_ALLOWED_ORIGINS", from: "the backend", to: "the Vercel domain" },
    ],
    rollback: {
      strategy: "application-only",
      note: "Migrations are forward only, so a rollback returns the application to the last verified release and leaves the schema in place. The schema stays compatible with the previous release by design.",
    },
  },
};

/* ------------------------------------------------------------ deployments */

const commit = {
  sha: "8f2c41a",
  message: "Refund endpoint returns the refund id",
  author: "A. Chen",
};

export const liveDeployment: Deployment = {
  id: "dep-1852-07",
  projectId: "p1",
  env: "preview",
  status: "awaiting-gate",
  previewUrl: "https://nexuspay-git-preview-acme-labs.vercel.app",
  startedAt: "2025-01-22 09:34",
  finishedAt: "2025-01-22 09:38",
  commit,
  steps: [
    { id: "build", label: "Build both applications", state: "done", duration: "1m 42s", detail: "frontend 38s, backend 64s" },
    { id: "smoke", label: "Re-run the smoke suite", state: "done", duration: "22s", detail: "18 tests, 18 passed" },
    { id: "scan", label: "Security scan", state: "done", duration: "31s", detail: "no new findings" },
    { id: "deploy", label: "Deploy to preview", state: "done", duration: "1m 04s", resource: "nexuspay-git-preview" },
  ],
};

/** The scene that makes the compensation behaviour visible. */
export const failedDeployment: Deployment = {
  id: "dep-1852-08",
  projectId: "p1",
  env: "preview",
  status: "failed",
  previewUrl: null,
  startedAt: "2025-01-22 09:52",
  finishedAt: "2025-01-22 09:54",
  commit,
  failure: {
    step: "provision-frontend",
    reason: "Vercel returned 402: the team has reached its project limit",
    compensated: true,
  },
  steps: [
    {
      id: "provision-db",
      label: "Create the database branch",
      state: "compensated",
      duration: "6s",
      resource: "nexuspay-db/preview-1852",
      detail: "Created, then deleted when the run failed",
    },
    {
      id: "provision-backend",
      label: "Create the backend service",
      state: "compensated",
      duration: "18s",
      resource: "nexuspay-api-preview",
      detail: "Created, then deleted when the run failed",
    },
    {
      id: "provision-frontend",
      label: "Create the frontend project",
      state: "failed",
      duration: "3s",
      detail: "Vercel returned 402: the team has reached its project limit",
    },
    { id: "build", label: "Build both applications", state: "pending" },
    { id: "deploy", label: "Deploy to preview", state: "pending" },
  ],
};

/* ------------------------------------------------------------------ proofs */

export const proofsPassing: Proof[] = [
  {
    id: "health",
    label: "Health check",
    state: "pass",
    detail: "GET /actuator/health returned 200 in 412 ms on the preview URL",
    source: "platform probe",
    at: "09:39",
  },
  {
    id: "smoke",
    label: "Smoke tests",
    state: "pass",
    detail: "18 tests against the preview URL, 18 passed, 0 failed",
    source: "platform probe",
    at: "09:40",
  },
];

export const proofsRunning: Proof[] = [
  {
    id: "health",
    label: "Health check",
    state: "pass",
    detail: "GET /actuator/health returned 200 in 412 ms on the preview URL",
    source: "platform probe",
    at: "09:39",
  },
  {
    id: "smoke",
    label: "Smoke tests",
    state: "running",
    detail: "11 of 18 tests run",
    source: "platform probe",
    at: null,
  },
];

/* ---------------------------------------------------------------- releases */

export const releases: Release[] = [
  {
    version: "v1.4.0",
    env: "production",
    deployedAt: "2025-01-21 16:20",
    approvedBy: "A. Chen",
    verified: true,
    commit: "5b1e07d",
    note: "Refund flow and KYC limit rule",
    current: true,
  },
  {
    version: "v1.3.2",
    env: "production",
    deployedAt: "2025-01-19 11:05",
    approvedBy: "S. Patel",
    verified: true,
    commit: "c3a99f1",
    note: "Payment receipt copy fixes",
    current: false,
  },
  {
    version: "v1.3.1",
    env: "production",
    deployedAt: "2025-01-17 14:48",
    approvedBy: "S. Patel",
    verified: true,
    commit: "9d2b4e8",
    note: "Session handling patch",
    current: false,
  },
  {
    version: "v1.3.0",
    env: "production",
    deployedAt: "2025-01-15 10:12",
    approvedBy: "A. Chen",
    verified: false,
    commit: "17c6aa0",
    note: "Rolled back the same day, smoke tests failed after promotion",
    current: false,
  },
];

/* ----------------------------------------------------------------- metrics */
// Decision 2: source and window on every tile, demo flag while fixtures answer.

export const liveMetrics: Metric[] = [
  {
    label: "Last deploy",
    value: "4m 12s",
    window: "22 Jan 09:34",
    source: "provider API",
    demo: true,
  },
  {
    label: "Current release",
    value: "v1.4.0",
    window: "verified 21 Jan 16:20",
    source: "platform records",
    demo: true,
  },
  {
    label: "Health check",
    value: "passing",
    window: "5 minute interval",
    source: "platform probe",
    demo: true,
    tone: "pass",
  },
  {
    label: "Uptime",
    value: "99.94%",
    window: "last 30 days, 5 minute interval",
    source: "platform probe",
    demo: true,
  },
];

export const degradedMetrics: Metric[] = [
  { label: "Last deploy", value: "4m 12s", window: "22 Jan 09:34", source: "provider API", demo: true },
  {
    label: "Current release",
    value: "v1.4.0",
    window: "verified 21 Jan 16:20",
    source: "platform records",
    demo: true,
  },
  {
    label: "Health check",
    value: "failing",
    window: "5 minute interval",
    source: "platform probe",
    demo: true,
    tone: "fail",
  },
  {
    label: "Uptime",
    value: "97.10%",
    window: "last 30 days, 5 minute interval",
    source: "platform probe",
    demo: true,
    tone: "caution",
  },
];

/* ---------------------------------------------------------------- feedback */
// C4 back to C1. The loop both documents describe in prose and never name.

export const feedbackReport: FeedbackReport = {
  reportId: "fb-1852-01",
  projectId: "p1",
  generatedAt: "2025-01-22 09:41",
  items: [
    {
      kind: "dependency",
      summary: "spring-security-crypto 7.0.0 changes the password encoder API",
      evidence: "Held at risk 88. Eight functions across four files would need migration.",
      suggestedRequirement: "Plan a password re-hash on next login before this upgrade lands",
    },
    {
      kind: "runtime",
      summary: "The backend sleeps after 15 minutes idle on the free tier",
      evidence: "First request after idle measured 4.2 s against 180 ms warm.",
      suggestedRequirement: "State a cold start expectation, or budget for an always-on instance",
    },
  ],
};

/* ------------------------------------------------------- console log scripts */

export type LogLine = { kind: "cmd" | "info" | "pass" | "fail" | "skip" | "detail" | "summary" | "muted"; text: string };

export const deployLog: LogLine[] = [
  { kind: "cmd", text: "orchestrator deploy --project nexuspay --env preview" },
  { kind: "muted", text: "plan plan-1852-03, 5 steps, idempotency key dep-1852-07" },
  { kind: "info", text: "step 1 of 5  create the database branch" },
  { kind: "pass", text: "neon  branch preview-1852 created in 6s" },
  { kind: "info", text: "step 2 of 5  create the backend service" },
  { kind: "pass", text: "render  nexuspay-api-preview created, DATABASE_URL set" },
  { kind: "info", text: "step 3 of 5  create the frontend project" },
  { kind: "pass", text: "vercel  nexuspay linked to frontend/, VITE_API_URL set" },
  { kind: "info", text: "step 4 of 5  build" },
  { kind: "muted", text: "frontend  vite build  38s" },
  { kind: "muted", text: "backend  gradle bootBuildImage  64s" },
  { kind: "info", text: "step 5 of 5  deploy to preview" },
  { kind: "pass", text: "preview ready  https://nexuspay-git-preview-acme-labs.vercel.app" },
  { kind: "summary", text: "deploy finished in 4m 12s, 5 steps, 0 failed" },
  { kind: "muted", text: "running the two proofs against the preview URL" },
];

/** The compensation scene, in order, for the failure scenario. */
export const compensationLog: LogLine[] = [
  { kind: "cmd", text: "orchestrator deploy --project nexuspay --env preview" },
  { kind: "muted", text: "plan plan-1852-03, 5 steps, idempotency key dep-1852-08" },
  { kind: "info", text: "step 1 of 5  create the database branch" },
  { kind: "pass", text: "neon  branch preview-1852 created in 6s" },
  { kind: "info", text: "step 2 of 5  create the backend service" },
  { kind: "pass", text: "render  nexuspay-api-preview created, DATABASE_URL set" },
  { kind: "info", text: "step 3 of 5  create the frontend project" },
  { kind: "fail", text: "vercel  402  the team has reached its project limit" },
  { kind: "muted", text: "the run cannot continue, compensating in reverse" },
  { kind: "info", text: "compensating step 2  delete the backend service" },
  { kind: "pass", text: "render  nexuspay-api-preview deleted" },
  { kind: "info", text: "compensating step 1  delete the database branch" },
  { kind: "pass", text: "neon  branch preview-1852 deleted" },
  { kind: "summary", text: "deploy failed at step 3, 2 steps compensated, 0 resources left behind" },
  { kind: "muted", text: "the same idempotency key can be retried safely once the limit is raised" },
];

/* ------------------------------------------------------------- activity log */

export const deploymentActivity: ActivityEntry[] = [
  {
    id: "d-a7",
    at: "2025-01-22 09:54",
    actor: "Deploy runner",
    actorKind: "system",
    action: "Compensated a failed run",
    target: "dep-1852-08",
    detail: "Deleted the Render service and the Neon branch. Nothing was left behind.",
  },
  {
    id: "d-a6",
    at: "2025-01-22 09:52",
    actor: "A. Chen",
    actorKind: "human",
    action: "Started a deploy",
    target: "preview",
    detail: "Retried after the project limit was reached.",
  },
  {
    id: "d-a5",
    at: "2025-01-22 09:40",
    actor: "Platform probe",
    actorKind: "agent",
    action: "Ran the two proofs",
    target: "dep-1852-07",
    detail: "Health check passed, smoke tests passed on the preview URL.",
  },
  {
    id: "d-a4",
    at: "2025-01-22 09:34",
    actor: "A. Chen",
    actorKind: "human",
    action: "Started a deploy",
    target: "preview",
    detail: "From commit 8f2c41a on main.",
  },
  {
    id: "d-a3",
    at: "2025-01-22 09:28",
    actor: "Deployment planner",
    actorKind: "agent",
    action: "Generated the deploy plan",
    target: "plan-1852-03",
    detail: "5 steps, 3 wiring rules, rollback is application only.",
  },
  {
    id: "d-a2",
    at: "2025-01-21 16:20",
    actor: "A. Chen",
    actorKind: "human",
    action: "Promoted to production",
    target: "v1.4.0",
    detail: "Both proofs green on the preview URL.",
  },
  {
    id: "d-a1",
    at: "2025-01-20 09:15",
    actor: "System",
    actorKind: "system",
    action: "Connection expired",
    target: "Render",
    detail: "The API key expired. Bindings were kept and deploys paused.",
  },
];

/* ------------------------------------------------ generated deploy configs */
// What the platform wrote into the repository so the providers know what to
// build. These are reviewable before anything runs, in the same viewer the Code
// Generation phase uses.

export const deployConfigFiles: FileEntry[] = [
  { path: "deploy-plan.json", type: "plan" },
  { path: "render.yaml", type: "blueprint" },
  { path: "vercel.json", type: "config" },
  { path: "backend/Dockerfile", type: "docker" },
  { path: ".github/workflows/ci.yml", type: "workflow" },
];

export const deployConfigContents: Record<string, string> = {
  "deploy-plan.json": JSON.stringify(deployPlans.p1, null, 2),

  "render.yaml": `services:
  - type: web
    name: nexuspay-api
    runtime: docker
    dockerfilePath: ./backend/Dockerfile
    dockerContext: ./backend
    plan: free
    healthCheckPath: /actuator/health
    envVars:
      - key: SPRING_PROFILES_ACTIVE
        value: production
      - key: DATABASE_URL
        sync: false          # written by the platform from the Neon binding
      - key: CORS_ALLOWED_ORIGINS
        sync: false          # written by the platform from the Vercel domain
      - key: JWT_SIGNING_KEY
        sync: false          # set by you in environment values
`,

  "vercel.json": `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "rootDirectory": "frontend",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "github": { "silent": true, "autoJobCancelation": true }
}
`,

  "backend/Dockerfile": `FROM eclipse-temurin:21-jdk AS build
WORKDIR /src
COPY gradle gradle
COPY gradlew build.gradle settings.gradle ./
RUN ./gradlew dependencies --no-daemon
COPY src src
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /src/build/libs/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
`,

  ".github/workflows/ci.yml": `# This workflow runs tests only. Deploying is the platform's job, so no
# provider credential is ever copied into this repository's secrets.
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
        working-directory: frontend
      - run: npm run test -- --run
        working-directory: frontend

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: 21
          distribution: temurin
          cache: gradle
      - run: ./gradlew test --no-daemon
        working-directory: backend
`,
};
