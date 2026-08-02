import { QueryClient } from "@tanstack/react-query";

export const runKeys = {
  all: ["runs"] as const,
  detail: (runId: string) => ["runs", runId] as const,
  validation: (runId: string) => ["runs", runId, "validation"] as const,
};

export const projectKeys = {
  all: ["projects"] as const,
  detail: (projectId: string) => ["projects", projectId] as const,
};

export const settingsKeys = {
  all: ["settings"] as const,
};

export const testingKeys = {
  all: ["testing"] as const,
  snapshot: (projectId: string) => ["testing", projectId, "snapshot"] as const,
  run: (projectId: string) => ["testing", projectId, "run"] as const,
  failures: (projectId: string) => ["testing", projectId, "failures"] as const,
  findings: (projectId: string) => ["testing", projectId, "findings"] as const,
  quality: (projectId: string) => ["testing", projectId, "quality"] as const,
  audit: (projectId: string) => ["testing", projectId, "audit"] as const,
  testFiles: (projectId: string) => ["testing", projectId, "test-files"] as const,
};

export function createQueryClientOptions() {
  return {
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  } as const;
}

export function createQueryClient() {
  return new QueryClient(createQueryClientOptions());
}
