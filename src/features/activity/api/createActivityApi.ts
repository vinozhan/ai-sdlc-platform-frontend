import { env } from "@/lib/env";
import { http } from "@/lib/http";
import {
  activityLogEntries,
  type ActivityLogEntry,
} from "../fixtures/activityData";

export interface ActivityApi {
  list(): Promise<ActivityLogEntry[]>;
}

function createFixtureActivityApi(): ActivityApi {
  return {
    async list() {
      return structuredClone(activityLogEntries);
    },
  };
}

function createHttpActivityApi(): ActivityApi {
  return {
    list: () => http.get<ActivityLogEntry[]>("/activity"),
  };
}

export const activityApi: ActivityApi = env.useFixtures
  ? createFixtureActivityApi()
  : createHttpActivityApi();
