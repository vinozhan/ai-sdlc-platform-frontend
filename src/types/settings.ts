/** Settings / integrations types. Secrets stay in memory — never persist tokens. */

export type DatabaseProvider = "neon" | "mongodb_atlas";

export interface SettingsState {
  git: {
    provider: string;
    token: string;
    defaultOrg: string;
    connected: boolean;
  };
  /** Frontend hosting (Vercel). */
  vercel: {
    token: string;
    team: string;
    connected: boolean;
  };
  /** Backend hosting (Render). */
  render: {
    apiKey: string;
    serviceId: string;
    region: string;
    connected: boolean;
  };
  /** Data stores: Neon (PostgreSQL) or MongoDB Atlas. */
  database: {
    provider: DatabaseProvider;
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
