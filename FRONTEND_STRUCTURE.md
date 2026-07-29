# Frontend Structure (finalized)

Companion to `structure.md`. That file describes the monorepo; this one fixes the shape of
`frontend/` so it stays workable as the four component services come online and the
orchestrator replaces the fixtures.

Two goals drive every decision here:

1. **The backend swap must be a deletion, not a rewrite.** When `/api/runs` exists, we
   should be turning fixtures off, not editing components.
2. **The frontend must mirror the system it drives.** A folder per component service, so
   `features/testing` <-> `services/c3-testing-security` <-> `validation-report.schema.json`
   line up by name. A new team member finds the code by knowing the architecture.

---

## The tree

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── .env.example                     # VITE_API_URL, VITE_USE_FIXTURES
└── src/
    ├── main.tsx                     # mount only
    │
    ├── app/                         # composition root - the only place that knows everything
    │   ├── App.tsx
    │   ├── routes.tsx               # EVERY route in one file (see "one router" below)
    │   ├── providers.tsx            # query client, router, theme, toasts
    │   └── layout/                  # Shell, Sidebar, TopBar, AccountMenu, CommandPalette
    │
    ├── features/                    # one folder per component service
    │   ├── projects/                #   project list, creation, selection
    │   ├── requirements/            #   C1  requirements & design
    │   ├── code-generation/         #   C2  wireframe -> code
    │   ├── testing/                 #   C3  testing & security
    │   ├── deployment/              #   C4  deployment & dependency
    │   └── activity/                #   audit log / traceability
    │       ├── api/                 #   typed calls for THIS feature only
    │       ├── components/          #   feature UI, split by step/panel
    │       ├── hooks/               #   feature hooks (useValidationRun, ...)
    │       ├── model/               #   pure derivation logic, no JSX, unit-testable
    │       ├── fixtures/            #   demo data for THIS feature only
    │       ├── page.tsx             #   composes the feature; thin
    │       └── index.ts             #   the only public door
    │
    ├── shared/                      # used by 2+ features, owned by none
    │   ├── ui/                      #   Button, Card, Badge, Table, ChevronStepper, Progress
    │   ├── code-viewer/             #   VSCodeEditor, VSCodeFileTree, syntaxHighlight
    │   ├── viz/                     #   lazy wrappers around graph/chart/diagram libraries
    │   ├── hooks/                   #   useMediaQuery, useDebounce, ...
    │   └── utils/                   #   cn(), formatters
    │
    ├── lib/                         # infrastructure, no product knowledge
    │   ├── http.ts                  #   fetch wrapper: base URL, auth, error normalisation
    │   ├── query.ts                 #   query client + shared cache keys
    │   └── env.ts                   #   typed access to import.meta.env
    │
    ├── types/                       # re-export of generated contract types + UI-only types
    └── store/                       # zustand: session, theme, UI prefs. NOT server data.
```

---

## Creating it

Run once from the repo root, in bash (WSL or Git Bash on Windows), on a fresh
`npm create vite@latest` TypeScript scaffold. It is idempotent, so re-running after you
have written code is safe: existing files are never overwritten.

```bash
cd frontend && mkdir -p \
  src/app/layout src/lib src/types src/store \
  src/shared/{ui,code-viewer,viz,hooks,utils} \
  src/features/{projects,requirements,code-generation,testing,deployment,activity,auth,marketing}/{api,components,hooks,model,fixtures} \
  && for d in src/features/*/; do [ -f "$d/index.ts" ] || printf '// Public door. Other layers may import only what is exported here.\n' > "$d/index.ts"; done \
  && [ -f src/vite-env.d.ts ] || printf '/// <reference types="vite/client" />\n' > src/vite-env.d.ts \
  && find src -type d -empty -exec touch {}/.gitkeep \; \
  && echo "frontend structure ready"
```

It creates the tree above, one `index.ts` door per feature, `vite-env.d.ts` (needed the
moment you import an image or read `import.meta.env`), and a `.gitkeep` in every empty
folder so the shape survives the first commit. Delete each `.gitkeep` as its folder fills.

### Then wire the `@/` alias

The structure assumes `@/lib/http` style imports. Two edits, both required, because the
current Vite template splits its TypeScript config:

`tsconfig.app.json`
```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

`vite.config.ts`
```ts
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
```

TypeScript resolves the first; the bundler resolves the second. Miss either one and
imports fail in only one of the two tools, which is a confusing hour.

---

## The backend seam

This is the part worth getting right, because it is what makes the integration cheap.

### 1. Types come from the contracts, never hand-written twice

`contracts/*.schema.json` is the source of truth. Generate `packages/contracts-ts` from it
in CI, and have the frontend import those types:

```ts
import type { ValidationReport, SAG, ApiContract } from "@sdlc/contracts-ts";
```

`src/types/` re-exports them plus UI-only types (view models, props). No hand-maintained
mirror of the schemas: when a contract changes, the build breaks in the right place.

### 2. One HTTP module, one place for cross-cutting concerns

`lib/http.ts` owns base URL, auth header, timeout, and turning a non-2xx into a typed
error. Nothing else calls `fetch` directly. Every feature's `api/` module is thin:

```ts
// features/testing/api/runs.ts
import { http } from "@/lib/http";
import type { ValidationReport } from "@sdlc/contracts-ts";

export const getValidationReport = (runId: string) =>
  http.get<ValidationReport>(`/runs/${runId}/validation`);

export const approvePhase = (runId: string, note?: string) =>
  http.post<void>(`/gates/${runId}/approve`, { note });
```

### 3. Fixtures live behind the network boundary, not inside components

Use MSW (Mock Service Worker) with handlers per feature. Components call the real API
module in every environment; MSW answers in development until the orchestrator is up:

```
features/testing/fixtures/handlers.ts   # msw handlers returning the demo run
app/providers.tsx                       # start MSW when VITE_USE_FIXTURES=true
```

The swap becomes one env flag. Nothing in the component tree knows which mode it is in,
and the handlers stay useful afterwards as test fixtures.

*Simpler fallback if MSW is too much:* keep a `features/*/api/` module with a
`USE_FIXTURES` branch inside it. Acceptable, but the branch lives forever and drifts.

### 4. Server state is cache state, not app state

The pipeline is long-running: runs stream, proofs re-verify, gates wait on a human. Use a
server-cache library (TanStack Query or equivalent) with polling for in-flight runs and
invalidation after a gate decision:

```ts
useQuery({ queryKey: ["run", runId], queryFn: () => getRun(runId),
           refetchInterval: (q) => (q.state.data?.status === "running" ? 2000 : false) });
```

**Zustand keeps UI state only:** theme, sidebar, active project, dialog state. Server data
in zustand means writing a cache by hand and inventing invalidation.

### 5. Environment

```
VITE_API_URL=http://localhost:8000        # orchestrator
VITE_USE_FIXTURES=true                    # false once the orchestrator answers
```

Read them once through `lib/env.ts` so a missing variable fails loudly at startup.

---

## Import rules (this is what keeps it standard)

```
app  ->  features  ->  shared / lib / types
```

- `app/` may import anything. It is the composition root.
- A feature may import `shared/`, `lib/`, `types/`. **A feature may never import another feature.**
- `shared/` and `lib/` may never import a feature. If shared code needs feature knowledge,
  it is not shared code.
- Cross-feature needs go through `app/` (compose both) or move the piece into `shared/`.
- Import a feature only through its `index.ts`, never a deep path.

If two features genuinely need the same panel, it moves to `shared/`. That single rule is
what prevents a second copy of a feature appearing, which has already happened once here.

---

## Where does it go?

| Adding | Goes in |
|---|---|
| A new screen for a component service | `features/<service>/components/` |
| A number derived from run data | `features/<service>/model/` (pure, tested) |
| A call to the orchestrator | `features/<service>/api/` |
| A button/badge/table used twice | `shared/ui/` |
| A wrapper around a heavy library | `shared/viz/` (lazy loaded) |
| Demo data for one feature | `features/<service>/fixtures/` |
| Auth, theme, sidebar state | `store/` |
| A route | `app/routes.tsx` |

---

## Conventions

- **One router.** All routes in `app/routes.tsx`, including nested project routes. Never a
  `<Routes>` inside a page component, and never a relative `<Navigate>` in a splat route.
- **Page files stay thin.** A `page.tsx` composes; it does not hold panels. If a file passes
  ~300 lines, a panel wants extracting.
- **Model logic is pure.** Anything computing counts, states or progress lives in `model/`
  with no JSX, so it can be unit tested without rendering.
- **Colocate tests:** `model/view.test.ts` beside `model/view.ts`.
- **Naming:** `PascalCase.tsx` for components, `camelCase.ts` for everything else, folders
  `kebab-case`.
- **Heavy libraries are lazy.** Graph, chart and diagram libraries load with the route that
  needs them (`React.lazy` + `Suspense`), never on first paint.

---

## Migration map from the current repo

| Today | Target |
|---|---|
| `pages/ProjectWorkspace.tsx` (755 lines: routes + shell + 8 sections + graph) | `app/routes.tsx` + `app/layout/ProjectShell.tsx` + `features/requirements/*` |
| `pages/TestingSecurity.tsx` + `components/testing/*` | `features/testing/` (`page.tsx`, `components/steps/*`, `model/view.ts`) |
| `pages/CodeGeneration.tsx`, `pages/DeploymentDependency.tsx`, `pages/ActivityLog.tsx` | `features/code-generation/`, `features/deployment/`, `features/activity/` |
| `pages/Projects.tsx`, `pages/NewProject.tsx`, `pages/Home.tsx` | `features/projects/` |
| `pages/Landing.tsx`, `pages/Login.tsx` | `features/marketing/`, `features/auth/` |
| `data/mockData.ts` (1060 lines, 6 importers) | split into each feature's `fixtures/` |
| `data/testingData.ts`, `data/testScenarios.ts` | `features/testing/fixtures/` (pick one; see below) |
| `components/ui/primitives.tsx`, `ChevronStepper` | `shared/ui/` (one file per component) |
| `components/code/*` | `shared/code-viewer/` |
| `components/ui/MermaidDiagram`, `components/sag/*`, recharts usage | `shared/viz/` as lazy wrappers |
| `components/layout/*`, `components/brand/*` | `app/layout/`, `shared/ui/brand/` |
| `store/useStore.ts` | `store/` split by slice: `session.ts`, `ui.ts` |
| `utils/cn.ts` | `shared/utils/cn.ts` |

---

## Deliberately not repeating

Four things that cost real time in the current repo:

1. **A shared data bag.** `data/mockData.ts` served every phase; removing one export broke
   an unrelated feature. Fixtures belong to a feature.
2. **Two implementations of one feature.** `components/testing/` and `TestTabPanel.tsx` both
   render the testing phase. A single `index.ts` door makes this hard to do by accident.
3. **Routing in two files.** A relative `<Navigate>` inside a nested splat route sent any
   unknown project URL into an infinite redirect. One router, absolute redirect targets.
4. **Global CSS hiding layout bugs.** `body { overflow-x: hidden }` masked a 416px overflow
   through three audit passes. Fix layouts; keep the overflow check as a test instead.

---

## Seed checklist for the new repo

- [ ] Scaffold with the current Vite + React + TS template; do **not** add
      `vite-plugin-singlefile` unless a single-file artifact is a hard requirement.
- [ ] Add `src/vite-env.d.ts` (`/// <reference types="vite/client" />`) on day one.
- [ ] Run the scaffold command in "Creating it" above, then wire the `@/` alias in both
      `tsconfig.app.json` and `vite.config.ts`.
- [ ] Wire `lib/http.ts`, `lib/env.ts`, `.env.example` before the first screen.
- [ ] Generate `packages/contracts-ts` from `contracts/` in CI; frontend imports it.
- [ ] Add the import-direction rule as lint (`eslint-plugin-import` `no-restricted-paths`),
      so the boundaries are enforced rather than remembered.
- [ ] Port features one at a time, taking the **fixed** versions from `web-responsive`
      (redirect fix, drawer accessibility, 16px touch fields, responsive grids).
- [ ] `tsc --noEmit` clean before the first commit, and keep it that way in CI.
```
