import { http, HttpResponse } from "msw";
import { getTestingSnapshot } from "../api/createTestingApi";

/**
 * MSW handlers aligned with `createHttpTestingApi` paths
 * (`http.get` joins `env.apiUrl` + path, so path-only patterns match).
 */
export const testingHandlers = [
  http.get("/projects/:projectId/testing/snapshot", () => {
    return HttpResponse.json(getTestingSnapshot());
  }),
  http.get("/projects/:projectId/testing/run", () => {
    const snap = getTestingSnapshot();
    return HttpResponse.json({
      run: snap.run,
      modules: snap.modules,
      transcript: snap.transcript,
      streamingTranscript: snap.streamingTranscript,
      streamProgress: snap.streamProgress,
      greenRun: snap.greenRun,
    });
  }),
  http.get("/projects/:projectId/testing/failures", () => {
    return HttpResponse.json({ failures: getTestingSnapshot().failures });
  }),
  http.get("/projects/:projectId/testing/findings", () => {
    const snap = getTestingSnapshot();
    return HttpResponse.json({
      findings: snap.findings,
      appliedFixes: snap.appliedFixes,
      severityOrder: snap.severityOrder,
      detectorNames: snap.detectorNames,
      detectorComparison: snap.detectorComparison,
    });
  }),
  http.get("/projects/:projectId/testing/quality", () => {
    return HttpResponse.json({ quality: getTestingSnapshot().quality });
  }),
  http.get("/projects/:projectId/testing/audit", () => {
    const snap = getTestingSnapshot();
    return HttpResponse.json({
      auditTrail: snap.auditTrail,
      decisionChain: snap.decisionChain,
    });
  }),
  http.get("/projects/:projectId/testing/test-files", () => {
    const snap = getTestingSnapshot();
    return HttpResponse.json({
      files: snap.testFiles,
      meta: snap.testFileMeta,
      contents: snap.testFileContents,
    });
  }),
];
