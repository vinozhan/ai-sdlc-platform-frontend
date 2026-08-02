import { avatarDefault as defaultAvatar } from "@/assets/img";
import type { SettingsState } from "@/types/settings";
import { env } from "@/lib/env";
import { http } from "@/lib/http";

export const defaultSettings: SettingsState = {
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

export interface SettingsApi {
  get(): Promise<SettingsState>;
  update(patch: Partial<SettingsState>): Promise<SettingsState>;
  updateGit(patch: Partial<SettingsState["git"]>): Promise<SettingsState>;
  updateVercel(patch: Partial<SettingsState["vercel"]>): Promise<SettingsState>;
  updateAzure(patch: Partial<SettingsState["azure"]>): Promise<SettingsState>;
  updateDatabase(patch: Partial<SettingsState["database"]>): Promise<SettingsState>;
  updateAi(patch: Partial<SettingsState["ai"]>): Promise<SettingsState>;
  updateProfile(patch: Partial<SettingsState["profile"]>): Promise<SettingsState>;
}

type Listener = () => void;

let settingsDb: SettingsState = structuredClone(defaultSettings);
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeSettings(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSettingsSnapshot(): SettingsState {
  return settingsDb;
}

function createFixtureSettingsApi(): SettingsApi {
  const set = (next: SettingsState) => {
    settingsDb = next;
    emit();
    return structuredClone(settingsDb);
  };

  return {
    async get() {
      return structuredClone(settingsDb);
    },
    async update(patch) {
      return set({ ...settingsDb, ...patch });
    },
    async updateGit(patch) {
      return set({ ...settingsDb, git: { ...settingsDb.git, ...patch } });
    },
    async updateVercel(patch) {
      return set({ ...settingsDb, vercel: { ...settingsDb.vercel, ...patch } });
    },
    async updateAzure(patch) {
      return set({ ...settingsDb, azure: { ...settingsDb.azure, ...patch } });
    },
    async updateDatabase(patch) {
      return set({ ...settingsDb, database: { ...settingsDb.database, ...patch } });
    },
    async updateAi(patch) {
      return set({ ...settingsDb, ai: { ...settingsDb.ai, ...patch } });
    },
    async updateProfile(patch) {
      return set({ ...settingsDb, profile: { ...settingsDb.profile, ...patch } });
    },
  };
}

function createHttpSettingsApi(): SettingsApi {
  return {
    get: () => http.get<SettingsState>("/settings"),
    update: (patch) => http.patch<SettingsState>("/settings", patch),
    updateGit: (patch) => http.patch<SettingsState>("/settings/git", patch),
    updateVercel: (patch) => http.patch<SettingsState>("/settings/vercel", patch),
    updateAzure: (patch) => http.patch<SettingsState>("/settings/azure", patch),
    updateDatabase: (patch) => http.patch<SettingsState>("/settings/database", patch),
    updateAi: (patch) => http.patch<SettingsState>("/settings/ai", patch),
    updateProfile: (patch) => http.patch<SettingsState>("/settings/profile", patch),
  };
}

export const settingsApi: SettingsApi = env.useFixtures
  ? createFixtureSettingsApi()
  : createHttpSettingsApi();
