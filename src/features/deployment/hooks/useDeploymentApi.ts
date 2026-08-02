import { useRef } from "react";
import type { DeploymentApi, ProviderState, DeploymentRecord, ReleaseRecord } from "../model/types";
import { createDeploymentApi, createDeploymentDb } from "../api/createDeploymentApi";

export function useDeploymentApi(projectKey: string): DeploymentApi {
  // Mutable fixture data lives in a ref so it persists across renders
  // without triggering re-renders itself.
  const dbRef = useRef<{
    providers: ProviderState[];
    deployments: DeploymentRecord[];
    releases: ReleaseRecord[];
  } | null>(null);

  if (!dbRef.current) {
    dbRef.current = createDeploymentDb(projectKey);
  }

  // Stable API object: created once and never replaced, so it is safe to use
  // as a useEffect dependency without triggering infinite re-renders.
  const apiRef = useRef<DeploymentApi | null>(null);

  if (!apiRef.current) {
    apiRef.current = createDeploymentApi(projectKey, dbRef.current);
  }

  return apiRef.current;
}
