import { create } from "zustand";
import { persist } from "zustand/middleware";
import defaultAvatar from "@/assets/avatar-default.jpg";

export type Theme = "light" | "dark";
export type ProjectStatus = "draft" | "analyzing" | "design" | "code" | "testing" | "deploy" | "complete";
export type ReqPhase = "input" | "parsing" | "entities" | "sag" | "architecture" | "uml" | "wireframes" | "sprint" | "done";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  requirementText: string;
  files: string[];
  reqPhase: ReqPhase;
  progress: number;
  techStack: string[];
  color: string;
}

export interface SettingsState {
  git: {
    provider: string;
    token: string;
    defaultOrg: string;
    connected: boolean;
  };
  vercel: {
    token: string;
    team: string;
    connected: boolean;
  };
  azure: {
    clientId: string;
    clientSecret: string;
    tenantId: string;
    subscriptionId: string;
    connected: boolean;
  };
  database: {
    type: "sql" | "nosql";
    engine: string;
    host: string;
    port: string;
    name: string;
    username: string;
    password: string;
    connectionString: string;
    connected: boolean;
  };
  ai: {
    provider: string;
    model: string;
    apiKey: string;
    temperature: number;
  };
  profile: {
    name: string;
    email: string;
    workspace: string;
    avatarUrl: string | null;
  };
}

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

const PROJECT_COLORS = ["#f97316", "#2563eb", "#3b82f6", "#22c55e", "#ec4899", "#06b6d4"];

const defaultSettings: SettingsState = {
  git: { provider: "github", token: "", defaultOrg: "acme-labs", connected: true },
  vercel: { token: "", team: "acme-labs", connected: true },
  azure: {
    clientId: "",
    clientSecret: "",
    tenantId: "",
    subscriptionId: "",
    connected: false,
  },
  database: {
    type: "sql",
    engine: "postgresql",
    host: "localhost",
    port: "5432",
    name: "nexuspay",
    username: "",
    password: "",
    connectionString: "",
    connected: false,
  },
  ai: { provider: "openai", model: "gpt-4o", apiKey: "", temperature: 0.2 },
  profile: {
    name: "Alex Chen",
    email: "alex@acme.dev",
    workspace: "Alex's Workspace",
    avatarUrl: defaultAvatar,
  },
};

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "NexusPay Banking",
    description: "Digital banking with payments, KYC, and fraud detection",
    status: "testing",
    createdAt: daysAgo(18),
    updatedAt: daysAgo(0),
    requirementText:
      "The system shall allow customers to make payments using credit cards and digital wallets. Integrate Stripe and PayPal. KYC verification is required before processing payments above $1000. All transactions must be audited.",
    files: ["NexusPay-SRS-v2.pdf"],
    reqPhase: "done",
    progress: 72,
    techStack: ["React", "Spring Boot", "PostgreSQL", "Kubernetes"],
    color: "#2563eb",
  },
  {
    id: "p2",
    name: "MediTrack EHR",
    description: "Electronic health records with HL7 integration",
    status: "code",
    createdAt: daysAgo(12),
    updatedAt: daysAgo(1),
    requirementText:
      "Build an EHR system for clinics with patient records, appointments, prescriptions, and HL7 FHIR interoperability. Role-based access for doctors, nurses, and admins.",
    files: ["MediTrack-Requirements.docx"],
    reqPhase: "done",
    progress: 54,
    techStack: ["Angular", "Node.js", "MongoDB", "Docker"],
    color: "#22c55e",
  },
  {
    id: "p3",
    name: "ShopFlow Commerce",
    description: "Headless commerce platform with microservices",
    status: "design",
    createdAt: daysAgo(8),
    updatedAt: daysAgo(2),
    requirementText:
      "Create a headless e-commerce platform with product catalog, cart, checkout, inventory sync, and order management. Support multi-tenant storefronts.",
    files: [],
    reqPhase: "done",
    progress: 38,
    techStack: ["React", "Express", "Redis", "AWS"],
    color: "#3b82f6",
  },
  {
    id: "p4",
    name: "NotifyHub",
    description: "Multi-channel notification orchestration service",
    status: "deploy",
    createdAt: daysAgo(25),
    updatedAt: daysAgo(3),
    requirementText:
      "Design a notification service supporting email, SMS, and push. Include templates, delivery tracking, retries, and preference management.",
    files: ["notify-brief.md"],
    reqPhase: "done",
    progress: 91,
    techStack: ["React", "Node.js", "PostgreSQL"],
    color: "#f97316",
  },
];

interface AppState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;

  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;

  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  createProject: (name: string, description?: string) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;

  settings: SettingsState;
  updateSettings: (patch: Partial<SettingsState>) => void;
  updateGitSettings: (patch: Partial<SettingsState["git"]>) => void;
  updateVercelSettings: (patch: Partial<SettingsState["vercel"]>) => void;
  updateAzureSettings: (patch: Partial<SettingsState["azure"]>) => void;
  updateDatabaseSettings: (patch: Partial<SettingsState["database"]>) => void;
  updateAiSettings: (patch: Partial<SettingsState["ai"]>) => void;
  updateProfile: (patch: Partial<SettingsState["profile"]>) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;

  // Requirements pipeline automation
  pipelineRunning: boolean;
  setPipelineRunning: (v: boolean) => void;
  startRequirementsPipeline: (projectId: string, text: string, files?: string[]) => void;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
  localStorage.setItem("sdlc-theme", theme);
}

const getInitialTheme = (): Theme => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("sdlc-theme");
    if (saved === "light" || saved === "dark") return saved;
  }
  return "light";
};

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

const phaseOrder: ReqPhase[] = [
  "parsing",
  "entities",
  "sag",
  "architecture",
  "uml",
  "wireframes",
  "sprint",
  "done",
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: initialTheme,
      toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        applyTheme(newTheme);
        set({ theme: newTheme });
      },
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      isAuthenticated: false,
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false, activeProjectId: null }),

      projects: MOCK_PROJECTS,
      activeProjectId: "p1",
      setActiveProjectId: (id) => set({ activeProjectId: id }),

      createProject: (name, description = "") => {
        const id = `proj_${Date.now().toString(36)}`;
        const now = new Date().toISOString();
        const color = PROJECT_COLORS[get().projects.length % PROJECT_COLORS.length];
        const project: Project = {
          id,
          name: name.trim(),
          description,
          status: "draft",
          createdAt: now,
          updatedAt: now,
          requirementText: "",
          files: [],
          reqPhase: "input",
          progress: 0,
          techStack: [],
          color,
        };
        set((s) => ({ projects: [project, ...s.projects], activeProjectId: id }));
        return project;
      },

      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
          ),
        })),

      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
        })),

      getProject: (id) => get().projects.find((p) => p.id === id),

      settings: defaultSettings,
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      updateGitSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, git: { ...s.settings.git, ...patch } } })),
      updateVercelSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, vercel: { ...s.settings.vercel, ...patch } } })),
      updateAzureSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, azure: { ...s.settings.azure, ...patch } } })),
      updateDatabaseSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, database: { ...s.settings.database, ...patch } } })),
      updateAiSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ai: { ...s.settings.ai, ...patch } } })),
      updateProfile: (patch) =>
        set((s) => ({ settings: { ...s.settings, profile: { ...s.settings.profile, ...patch } } })),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      toasts: [],
      addToast: (toast) => {
        const id = Math.random().toString(36).slice(2);
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 4000);
      },
      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      pipelineRunning: false,
      setPipelineRunning: (v) => set({ pipelineRunning: v }),

      startRequirementsPipeline: (projectId, text, files = []) => {
        const { updateProject, addToast, setPipelineRunning } = get();
        setPipelineRunning(true);
        updateProject(projectId, {
          requirementText: text,
          files,
          reqPhase: "parsing",
          status: "analyzing",
          progress: 8,
        });
        addToast({ type: "info", title: "Analyzing requirements", message: "AI pipeline started" });

        let step = 0;
        const tick = () => {
          step += 1;
          const phase = phaseOrder[Math.min(step, phaseOrder.length - 1)];
          const progress = Math.min(100, Math.round((step / (phaseOrder.length - 1)) * 100));
          const status: ProjectStatus =
            phase === "done" ? "design" : phase === "parsing" || phase === "entities" ? "analyzing" : "design";

          updateProject(projectId, {
            reqPhase: phase,
            progress,
            status,
            techStack: step >= 3 ? ["React", "Spring Boot", "PostgreSQL"] : [],
          });

          if (phase === "done") {
            setPipelineRunning(false);
            addToast({
              type: "success",
              title: "Requirements complete",
              message: "Architecture, UML, wireframes, and sprint plan are ready",
            });
            return;
          }

          setTimeout(tick, 1400);
        };

        setTimeout(tick, 1400);
      },
    }),
    {
      name: "sdlc-ai-store-v2",
      partialize: (s) => ({
        projects: s.projects,
        activeProjectId: s.activeProjectId,
        settings: s.settings,
        theme: s.theme,
        isAuthenticated: s.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyTheme(state.theme);
        // Ensure demo projects exist for first-time / wiped storage
        if (state && (!state.projects || state.projects.length === 0)) {
          state.projects = MOCK_PROJECTS;
          state.activeProjectId = "p1";
        }
        if (state?.settings) {
          state.settings = {
            ...defaultSettings,
            ...state.settings,
            git: { ...defaultSettings.git, ...state.settings.git },
            vercel: { ...defaultSettings.vercel, ...state.settings.vercel },
            azure: { ...defaultSettings.azure, ...state.settings.azure },
            database: { ...defaultSettings.database, ...state.settings.database },
            ai: { ...defaultSettings.ai, ...state.settings.ai },
            profile: { ...defaultSettings.profile, ...state.settings.profile },
          };
        }
      },
    }
  )
);
