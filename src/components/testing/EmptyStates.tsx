import { AlertTriangle, ArrowUpRight, FlaskConical, RefreshCw } from "lucide-react";
import { Button, Card } from "@/components/ui/primitives";
import { Note } from "@/components/testing/bits";

const willHappen = [
  "Write unit and integration tests from the requirements and the code, then run them.",
  "Triage every failure: repair the brittle tests, route the real regressions to a developer untouched.",
  "Measure line coverage, branch coverage, and how many planted bugs the tests catch.",
  "Scan for security issues with a local model and an AI reviewer, then combine the results.",
  "Prove each applied fix twice: the scan runs again, and so does the whole suite.",
  "Roll all of it into one report for you to approve before Deployment starts.",
];

export function PhaseNotStarted({
  projectName,
  onOpenCode,
}: {
  projectName: string;
  onOpenCode: () => void;
}) {
  return (
    <Card className="mx-auto max-w-3xl overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-5 dark:border-white/[0.05]">
        <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/15">
          <FlaskConical className="h-4 w-4 text-blue-600 dark:text-blue-300" />
        </span>
        <h3 className="text-[15px] font-semibold tracking-tight">Testing has not started for {projectName}</h3>
        <Note className="mt-1.5 max-w-2xl">
          This phase runs on a build. As soon as Code Generation produces one, six things happen here, in this order.
        </Note>
      </div>

      <ol className="px-5 py-4">
        {willHappen.map((line, i) => (
          <li key={line} className="flex gap-3 py-2">
            <span className="tp-label mt-[3px] shrink-0">{String(i + 1).padStart(2, "0")}</span>
            <span className="tp-prose">{line}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 bg-slate-50 px-5 py-3.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
        <div className="min-w-0 flex-1">
          <p className="tp-label">Waiting on</p>
          <p className="mt-1 text-[13px]">Code Generation — no build has been produced yet.</p>
        </div>
        <Button variant="outline" onClick={onOpenCode}>
          Open Code Generation
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}

export function PhaseLoadError({ build, onRetry }: { build: number; onRetry: () => void }) {
  return (
    <Card className="mx-auto max-w-2xl overflow-hidden">
      <div className="px-5 py-5">
        <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        </span>
        <h3 className="text-[15px] font-semibold tracking-tight">We could not load the test run for Build {build}</h3>
        <Note className="mt-1.5">
          The run service answered while we were fetching the suite results, so the numbers on this page would be
          incomplete. Nothing was changed and no decision was recorded.
        </Note>
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 font-mono text-[11.5px] text-slate-600 dark:bg-white/[0.03] dark:text-slate-400">
          503 · GET /runs/{build}/results · retried twice
        </p>
        <Button variant="primary" className="mt-4" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    </Card>
  );
}
