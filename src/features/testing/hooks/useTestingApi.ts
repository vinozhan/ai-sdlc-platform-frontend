import { useQuery } from "@tanstack/react-query";
import { testingKeys } from "@/lib/query";
import { env } from "@/lib/env";
import {
  getTestingSnapshot,
  testingApi,
  type TestingSnapshot,
} from "../api/createTestingApi";

/**
 * Sync fixture accessor for the demo page.
 * Prefer `useTestingSnapshot` when talking to a real backend.
 */
export function useTestingFixtures(): TestingSnapshot {
  return getTestingSnapshot();
}

export function useTestingSnapshot(projectId: string | null | undefined) {
  const id = projectId ?? "";

  return useQuery({
    queryKey: testingKeys.snapshot(id),
    queryFn: () => testingApi.getSnapshot(id),
    enabled: Boolean(projectId),
    // Fixture mode can resolve immediately via the sync accessor when preferred.
    initialData: env.useFixtures && projectId ? getTestingSnapshot() : undefined,
    staleTime: env.useFixtures ? Infinity : 30_000,
  });
}

export function useTestingRun(projectId: string | null | undefined) {
  const id = projectId ?? "";
  return useQuery({
    queryKey: testingKeys.run(id),
    queryFn: () => testingApi.getRun(id),
    enabled: Boolean(projectId),
  });
}

export function useTestingFailures(projectId: string | null | undefined) {
  const id = projectId ?? "";
  return useQuery({
    queryKey: testingKeys.failures(id),
    queryFn: () => testingApi.getFailures(id),
    enabled: Boolean(projectId),
  });
}

export function useTestingFindings(projectId: string | null | undefined) {
  const id = projectId ?? "";
  return useQuery({
    queryKey: testingKeys.findings(id),
    queryFn: () => testingApi.getFindings(id),
    enabled: Boolean(projectId),
  });
}

export function useTestingQuality(projectId: string | null | undefined) {
  const id = projectId ?? "";
  return useQuery({
    queryKey: testingKeys.quality(id),
    queryFn: () => testingApi.getQuality(id),
    enabled: Boolean(projectId),
  });
}

export function useTestingAudit(projectId: string | null | undefined) {
  const id = projectId ?? "";
  return useQuery({
    queryKey: testingKeys.audit(id),
    queryFn: () => testingApi.getAudit(id),
    enabled: Boolean(projectId),
  });
}

export function useTestingTestFiles(projectId: string | null | undefined) {
  const id = projectId ?? "";
  return useQuery({
    queryKey: testingKeys.testFiles(id),
    queryFn: () => testingApi.getTestFiles(id),
    enabled: Boolean(projectId),
  });
}

export { testingApi };
