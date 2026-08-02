/** Settings / integrations types. Secrets stay in memory — never persist tokens. */

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
