import { ArrowUpRight, FileCode2, FlaskConical } from "lucide-react";
import { cn } from "@/utils/cn";
import { Td, Th } from "@/components/ui/primitives";
import { VSCodeFileTree } from "@/components/code/VSCodeFileTree";
import { VSCodeEditor, type EditorTab } from "@/components/code/VSCodeEditor";
import { Bar, Console, Panel } from "@/components/testing/bits";
import type { StepId, TestingView } from "@/components/testing/view";
import { testFileMeta, testFiles, testFileContents } from "@/data/testingData";

export function StepTests({
  view,
  onGoTo,
  onOpenFailure,
  tabs,
  activePath,
  highlight,
  onSelectFile,
  onSelectTab,
  onCloseTab,
  viewerRef,
}: {
  view: TestingView;
  onGoTo: (step: StepId) => void;
  onOpenFailure: (failureId: string) => void;
  tabs: EditorTab[];
  activePath: string;
  highlight?: { path: string; line: number; label?: string };
  onSelectFile: (path: string) => void;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
  viewerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const meta = testFileMeta[activePath];
  const failure = meta?.failureId ? view.failures.find((f) => f.id === meta.failureId) : undefined;
  const healed = meta?.healedId ? view.failures.find((f) => f.id === meta.healedId) : undefined;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Panel
          icon={<FlaskConical className="h-4 w-4 text-blue-400" />}
          label="Suite results"
          title="Unit and integration tests, by module"
          meta={`${view.totals.run} tests run · ${view.totals.skipped} skipped · ${view.duration}`}
          bodyClassName="p-0"
        >
          <div className="w-full overflow-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr>
                  <Th>Module</Th>
                  <Th className="text-right">Passed</Th>
                  <Th className="text-right">Failed</Th>
                  <Th className="text-right">Skipped</Th>
                  <Th className="text-right">Pass rate</Th>
                </tr>
              </thead>
              <tbody>
                {view.modules.map((m) => {
                  const run = m.passed + m.failed;
                  const rate = run === 0 ? 0 : (m.passed / run) * 100;
                  return (
                    <tr key={m.id}>
                      <Td>
                        <p className="text-[13px] font-medium">{m.name}</p>
                        <p className="tp-den mt-0.5">
                          {m.runner} · protects {m.requirements.join(", ")}
                        </p>
                      </Td>
                      <Td className="text-right tabular-nums">{m.passed}</Td>
                      <Td className="text-right">
                        {m.failed > 0 ? (
                          <button
                            type="button"
                            onClick={() => onOpenFailure(m.failureIds[0])}
                            className="inline-flex items-center gap-1 font-medium tabular-nums text-red-600 underline decoration-red-200 underline-offset-2 hover:decoration-red-500 dark:text-red-400 dark:decoration-red-500/40"
                            title={`Open ${m.failed} ${m.failed === 1 ? "failure" : "failures"} in the inbox`}
                          >
                            {m.failed}
                            <ArrowUpRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <span className="tabular-nums text-slate-400 dark:text-slate-600">0</span>
                        )}
                      </Td>
                      <Td className="text-right tabular-nums text-slate-400 dark:text-slate-500">{m.skipped}</Td>
                      <Td>
                        <div className="flex items-center justify-end gap-2">
                          <div className="hidden w-16 sm:block">
                            <Bar value={rate} tone={m.failed > 0 ? "caution" : "pass"} />
                          </div>
                          <span className="w-[52px] text-right tabular-nums">{rate.toFixed(1)}%</span>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <Td className="font-semibold">All modules</Td>
                  <Td className="text-right font-semibold tabular-nums">{view.totals.passed}</Td>
                  <Td
                    className={cn(
                      "text-right font-semibold tabular-nums",
                      view.totals.failed > 0 && "text-red-600 dark:text-red-400"
                    )}
                  >
                    {view.totals.failed}
                  </Td>
                  <Td className="text-right tabular-nums text-slate-400 dark:text-slate-500">{view.totals.skipped}</Td>
                  <Td className="text-right font-semibold tabular-nums">{view.totals.passRate.toFixed(1)}%</Td>
                </tr>
              </tfoot>
            </table>
          </div>
          {view.awaitingRerun > 0 && (
            <p className="tp-den flex flex-wrap items-center gap-1 border-t border-[color:var(--tp-line)] bg-blue-500/5 px-4 py-2.5 leading-relaxed">
              <span>
                {view.awaitingRerun} approved {view.awaitingRerun === 1 ? "repair is" : "repairs are"} counted as passing
                because the guard ran {view.awaitingRerun === 1 ? "it" : "them"} against this build&apos;s code. Build{" "}
                {view.build + 1} records {view.awaitingRerun === 1 ? "it" : "them"}.
              </span>
              <button
                type="button"
                onClick={() => onOpenFailure(view.failures.find((f) => f.awaitingRerun)?.id ?? "")}
                className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
              >
                Show {view.awaitingRerun === 1 ? "it" : "them"}
              </button>
            </p>
          )}
          <p className="tp-den border-t border-[color:var(--tp-line)] px-4 py-2.5 leading-relaxed">
            Pass rate is passed ÷ run. Skipped tests are not counted as run. Coverage is a different measure - how much
            of the code the tests execute - and it lives in{" "}
            <button
              type="button"
              onClick={() => onGoTo("quality")}
              className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
            >
              step 3, Quality
            </button>
            .
          </p>
        </Panel>

        <Console
          label="Run transcript"
          lines={view.transcript}
          streaming={view.streaming}
          meta={
            view.streaming
              ? `build ${view.build} · running`
              : `build ${view.build} · recorded ${view.finishedAt.slice(11)} · ${view.duration}`
          }
          className="h-[300px] sm:h-[420px]"
        />
      </div>

      <Panel
        icon={<FileCode2 className="h-4 w-4 text-blue-400" />}
        label="Generated tests"
        title="The repository, filtered to test files"
        meta="Backend tests run on JUnit, frontend tests on Vitest. Each test sits where the code it protects sits."
        bodyClassName="p-0"
      >
        <div ref={viewerRef} className="grid grid-cols-1 gap-4 p-3 sm:p-4 lg:h-[560px] lg:grid-cols-[minmax(0,290px)_minmax(0,1fr)]">
          <div className="h-[220px] min-h-0 min-w-0 lg:h-auto">
            <VSCodeFileTree
              title="Explorer"
              files={testFiles}
              collapseChains
              selectedPath={activePath}
              onSelect={onSelectFile}
              tagTitle={() => "Open the repair in the failure inbox"}
              onTagClick={(path) => {
                const healedId = testFileMeta[path]?.healedId;
                if (healedId) onOpenFailure(healedId);
              }}
            />
          </div>
          <div className="h-[360px] min-h-0 min-w-0 sm:h-[420px] lg:h-auto">
            <VSCodeEditor
              tabs={tabs}
              activePath={activePath}
              contents={testFileContents}
              onSelectTab={onSelectTab}
              onCloseTab={onCloseTab}
              highlight={highlight}
              showLanguage
              copyable
              statusBar={
                meta && (
                  <>
                    <span className="tp-mono">
                      Protects {meta.requirement} · {meta.requirementTitle}
                    </span>
                    {failure && (
                      <button
                        type="button"
                        onClick={() => onOpenFailure(failure.id)}
                        className="inline-flex items-center gap-1 text-red-600 underline underline-offset-2 dark:text-red-400"
                      >
                        <FileCode2 className="h-3 w-3" />
                        Open the failure
                      </button>
                    )}
                    {healed && (
                      <button
                        type="button"
                        onClick={() => onOpenFailure(healed.id)}
                        className="inline-flex items-center gap-1 text-emerald-600 underline underline-offset-2 dark:text-emerald-400"
                      >
                        Healed - open the repair
                      </button>
                    )}
                  </>
                )
              }
            />
          </div>
        </div>
      </Panel>
    </div>
  );
}
