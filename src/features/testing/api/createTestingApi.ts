import type { FileEntry } from "@/shared/code-viewer/buildFileTree";
import { env } from "@/lib/env";
import { http } from "@/lib/http";
import { auditTrail, decisionChain } from "../fixtures/audit";
import {
  appliedFixes,
  detectorComparison,
  detectorNames,
  findings,
  severityOrder,
} from "../fixtures/findings";
import { failures, testFileContents, testFileMeta, testFiles } from "../fixtures/failures";
import { quality } from "../fixtures/quality";
import {
  greenRun,
  runTranscript,
  streamProgress,
  streamingTranscript,
  suiteModules,
  testingRun,
} from "../fixtures/runs";
import type {
  AppliedFix,
  AuditEntry,
  ConsoleLine,
  DecisionChainStep,
  Detector,
  DetectorComparison,
  FailureItem,
  Finding,
  GreenRun,
  Quality,
  Severity,
  SuiteModule,
  TestFileMeta,
  TestingRun,
} from "../fixtures/types";

const FIXTURE_DELAY_MS = 120;

export type TestingRunPayload = {
  run: TestingRun;
  modules: SuiteModule[];
  transcript: ConsoleLine[];
  streamingTranscript: ConsoleLine[];
  streamProgress: Record<number, { passed: number; failed: number }>;
  greenRun: GreenRun;
};

export type TestingFailuresPayload = {
  failures: FailureItem[];
};

export type TestingFindingsPayload = {
  findings: Finding[];
  appliedFixes: AppliedFix[];
  severityOrder: Severity[];
  detectorNames: Record<Detector, string>;
  detectorComparison: DetectorComparison;
};

export type TestingQualityPayload = {
  quality: Quality;
};

export type TestingAuditPayload = {
  auditTrail: AuditEntry[];
  decisionChain: DecisionChainStep[];
};

export type TestingTestFilesPayload = {
  files: FileEntry[];
  meta: Record<string, TestFileMeta>;
  contents: Record<string, string>;
};

/** Full phase payload used by the demo page + buildView. */
export type TestingSnapshot = TestingRunPayload &
  TestingFailuresPayload &
  TestingFindingsPayload &
  TestingQualityPayload &
  TestingAuditPayload & {
    testFiles: FileEntry[];
    testFileMeta: Record<string, TestFileMeta>;
    testFileContents: Record<string, string>;
  };

export interface TestingApi {
  getSnapshot(projectId: string): Promise<TestingSnapshot>;
  getRun(projectId: string): Promise<TestingRunPayload>;
  getFailures(projectId: string): Promise<TestingFailuresPayload>;
  getFindings(projectId: string): Promise<TestingFindingsPayload>;
  getQuality(projectId: string): Promise<TestingQualityPayload>;
  getAudit(projectId: string): Promise<TestingAuditPayload>;
  getTestFiles(projectId: string): Promise<TestingTestFilesPayload>;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

/** Sync fixture snapshot for the demo page (no network). */
export function getTestingSnapshot(): TestingSnapshot {
  return {
    run: structuredClone(testingRun),
    modules: structuredClone(suiteModules),
    transcript: structuredClone(runTranscript),
    streamingTranscript: structuredClone(streamingTranscript),
    streamProgress: structuredClone(streamProgress),
    greenRun: structuredClone(greenRun),
    failures: structuredClone(failures),
    findings: structuredClone(findings),
    appliedFixes: structuredClone(appliedFixes),
    severityOrder: [...severityOrder],
    detectorNames: { ...detectorNames },
    detectorComparison: structuredClone(detectorComparison),
    quality: structuredClone(quality),
    auditTrail: structuredClone(auditTrail),
    decisionChain: structuredClone(decisionChain),
    testFiles: structuredClone(testFiles),
    testFileMeta: structuredClone(testFileMeta),
    testFileContents: structuredClone(testFileContents),
  };
}

function createFixtureTestingApi(): TestingApi {
  return {
    async getSnapshot(_projectId) {
      await sleep(FIXTURE_DELAY_MS);
      return getTestingSnapshot();
    },
    async getRun(_projectId) {
      await sleep(FIXTURE_DELAY_MS);
      const snap = getTestingSnapshot();
      return {
        run: snap.run,
        modules: snap.modules,
        transcript: snap.transcript,
        streamingTranscript: snap.streamingTranscript,
        streamProgress: snap.streamProgress,
        greenRun: snap.greenRun,
      };
    },
    async getFailures(_projectId) {
      await sleep(FIXTURE_DELAY_MS);
      return { failures: structuredClone(failures) };
    },
    async getFindings(_projectId) {
      await sleep(FIXTURE_DELAY_MS);
      const snap = getTestingSnapshot();
      return {
        findings: snap.findings,
        appliedFixes: snap.appliedFixes,
        severityOrder: snap.severityOrder,
        detectorNames: snap.detectorNames,
        detectorComparison: snap.detectorComparison,
      };
    },
    async getQuality(_projectId) {
      await sleep(FIXTURE_DELAY_MS);
      return { quality: structuredClone(quality) };
    },
    async getAudit(_projectId) {
      await sleep(FIXTURE_DELAY_MS);
      return {
        auditTrail: structuredClone(auditTrail),
        decisionChain: structuredClone(decisionChain),
      };
    },
    async getTestFiles(_projectId) {
      await sleep(FIXTURE_DELAY_MS);
      return {
        files: structuredClone(testFiles),
        meta: structuredClone(testFileMeta),
        contents: structuredClone(testFileContents),
      };
    },
  };
}

function createHttpTestingApi(): TestingApi {
  const base = (projectId: string) => `/projects/${projectId}/testing`;

  return {
    getSnapshot: (projectId) => http.get<TestingSnapshot>(`${base(projectId)}/snapshot`),
    getRun: (projectId) => http.get<TestingRunPayload>(`${base(projectId)}/run`),
    getFailures: (projectId) => http.get<TestingFailuresPayload>(`${base(projectId)}/failures`),
    getFindings: (projectId) => http.get<TestingFindingsPayload>(`${base(projectId)}/findings`),
    getQuality: (projectId) => http.get<TestingQualityPayload>(`${base(projectId)}/quality`),
    getAudit: (projectId) => http.get<TestingAuditPayload>(`${base(projectId)}/audit`),
    getTestFiles: (projectId) => http.get<TestingTestFilesPayload>(`${base(projectId)}/test-files`),
  };
}

export function createTestingApi(): TestingApi {
  return env.useFixtures ? createFixtureTestingApi() : createHttpTestingApi();
}

export const testingApi: TestingApi = createTestingApi();
