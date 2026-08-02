import { DecisionBar } from "./components/DecisionBar";
import { PhaseLoadError, PhaseNotStarted } from "./components/EmptyStates";
import { SummaryStrip } from "./components/PhaseChrome";
import { TestingHeader, TestingStepper } from "./components/TestingHeader";
import { StepHealing } from "./components/steps/StepHealing";
import { StepQuality } from "./components/steps/StepQuality";
import { StepReport } from "./components/steps/StepReport";
import { StepReverify } from "./components/steps/StepReverify";
import { StepSecurity } from "./components/steps/StepSecurity";
import { StepTests } from "./components/steps/StepTests";
import { useTestingPage } from "./hooks";

export function TestingSecurity() {
  const page = useTestingPage();

  if (page.effective === "empty" || page.effective === "error") {
    return (
      <div className="tp w-full px-6 pb-10 pt-6 md:px-8 md:pt-8">
        <TestingHeader
          progress={page.view.progress}
          isDark={page.isDark}
          running={page.running}
          onRerun={page.startRerun}
        />
        <div className="mt-8">
          {page.effective === "empty" ? (
            <PhaseNotStarted projectName={page.project?.name ?? "this project"} onOpenCode={page.openCode} />
          ) : (
            <PhaseLoadError build={page.testingRun.build} onRetry={page.retryLoad} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="tp w-full px-4 pb-6 pt-4 sm:px-6 md:px-8 md:pt-8">
      <TestingHeader
        progress={page.view.progress}
        isDark={page.isDark}
        running={page.running}
        onRerun={page.startRerun}
      />

      <div className="mt-5">
        <TestingStepper
          steps={page.stepperSteps}
          progressId={page.progressId}
          selectedId={page.step}
          isDark={page.isDark}
          onStepClick={page.setStep}
        />
      </div>

      <div role="tabpanel" className="space-y-4 pt-5">
        {page.step === "tests" && (
          <>
            <SummaryStrip view={page.view} onGoTo={page.goToFromSummary} />
            <StepTests
              view={page.view}
              testFiles={page.data.testFiles}
              testFileMeta={page.data.testFileMeta}
              testFileContents={page.data.testFileContents}
              onGoTo={page.setStep}
              onOpenFailure={page.openFailure}
              tabs={page.tabs}
              activePath={page.activePath}
              highlight={page.highlight}
              onSelectFile={page.selectFile}
              onSelectTab={page.selectTab}
              onCloseTab={page.closeTab}
              viewerRef={page.viewerRef}
            />
          </>
        )}

        {page.step === "healing" && (
          <StepHealing
            view={page.view}
            filter={page.inboxFilter}
            onFilter={page.setInboxFilter}
            selectedId={page.selectedFailure}
            onSelect={page.setSelectedFailure}
            onApprove={page.approveRepair}
            onReject={page.rejectRepair}
            onOpenFile={page.openFileAt}
          />
        )}

        {page.step === "quality" && <StepQuality view={page.view} />}

        {page.step === "security" && (
          <StepSecurity
            view={page.view}
            severityOrder={page.data.severityOrder}
            detectorComparison={page.data.detectorComparison}
            expandedId={page.expandedFinding}
            onExpand={page.setExpandedFinding}
            onApplyFix={page.applyFix}
            onDismiss={page.dismissFinding}
            onGoTo={page.setStep}
          />
        )}

        {page.step === "reverify" && (
          <StepReverify view={page.view} onGoTo={page.setStep} onRetry={page.retryProofs} />
        )}

        {page.step === "report" && (
          <StepReport
            view={page.view}
            run={page.testingRun}
            decisionChain={page.data.decisionChain}
            onGoTo={page.setStep}
            onOpenDeployment={page.openDeployment}
            onRollback={page.rollback}
          />
        )}
      </div>

      {page.view.decisionPending && (
        <div className="mt-6">
          <DecisionBar view={page.view} onApprove={page.approvePhase} onRequestChanges={page.requestChanges} />
        </div>
      )}
    </div>
  );
}

export default TestingSecurity;
