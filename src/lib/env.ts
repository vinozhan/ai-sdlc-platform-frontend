/**
 * Typed access to Vite public env. Fail loud at startup if required vars are missing.
 * Only VITE_* values are available in the client bundle — never put secrets here.
 */

function requireEnv(key: keyof ImportMetaEnv, value: string | undefined): string {
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return value === "true" || value === "1";
}

export const env = {
  /** Defaults for local demo when `.env` is absent; override via VITE_API_URL. */
  apiUrl: import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000",
  useFixtures: parseBool(import.meta.env.VITE_USE_FIXTURES, true),
} as const;

/** Call at bootstrap if you need hard-fail for production deploys. */
export function assertProductionEnv() {
  if (import.meta.env.PROD) {
    requireEnv("VITE_API_URL", import.meta.env.VITE_API_URL);
  }
}
