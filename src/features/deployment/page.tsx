import { ChevronStepper, PhaseSectionHeader } from "@/shared/ui";
import type { StageId } from "./model/types";
import { deploymentSteps } from "./model/stages";
import { useDeploymentPage } from "./hooks";
import {
  ArtifactBrowser,
  DependencyPanel,
  LivePanel,
  ReleaseActions,
  RepoPanel,
  StageAlerts,
  VerifyPanel,
} from "./components";

export function DeploymentDependency() {
  const page = useDeploymentPage();

  return (
    <div className="w-full space-y-5 p-4 sm:p-6 md:p-8">
      <PhaseSectionHeader
        title="Deployment"
        subtitle={
          page.waitingForTesting
            ? "Not started: waiting for the Testing gate."
            : "Connect providers, pre-flight dependencies, release, verify preview, and promote to production."
        }
        progress={page.phaseProgress}
        isDark={page.isDark}
        action={undefined}
      />

      <ChevronStepper
        steps={deploymentSteps.map((s) => ({
          ...s,
          badge: page.stageBadges[s.id as keyof typeof page.stageBadges],
        }))}
        progressId={page.progressId}
        selectedId={page.activeStage}
        isDark={page.isDark}
        onStepClick={(id) => page.goToStage(id as StageId)}
      />

      {page.activeStage === "connect" && (
        <RepoPanel providers={page.providers} onConnectProvider={page.connectProvider} />
      )}

      {page.activeStage === "dependencies" && (
        <DependencyPanel
          selectedUpdateId={page.selectedUpdateId}
          onSelectUpdate={page.setSelectedUpdateId}
          onApply={page.applyDependency}
          onRevert={page.revertDependency}
        />
      )}

      {page.activeStage === "release" && (
        <ReleaseActions
          artifactBrowser={
            <ArtifactBrowser
              tabs={page.editor.tabs}
              activePath={page.editor.activePath}
              onSelectFile={page.editor.openFile}
              onSelectTab={page.editor.setActivePath}
              onCloseTab={page.editor.closeTab}
            />
          }
          template={page.template}
          onTemplateChange={page.setTemplate}
          onStartDeploy={() => void page.startDeploy()}
          providersReady={page.providersReady}
          waitingForTesting={page.waitingForTesting}
          deployments={page.deployments}
          logs={page.logs}
        />
      )}

      {page.activeStage === "verify" && (
        <VerifyPanel
          deployments={page.deployments}
          proofs={page.proofs}
          gateNote={page.gateNote}
          onGateNoteChange={page.setGateNote}
          onRequestChanges={page.requestChanges}
          onPromote={() => void page.promote()}
        />
      )}

      {page.activeStage === "live" && (
        <LivePanel
          deployments={page.deployments}
          metrics={page.metrics}
          releases={page.releases}
          onRequestRollback={page.setPendingRollback}
        />
      )}

      <StageAlerts
        activeStage={page.activeStage}
        waitingForTesting={page.waitingForTesting}
        proofsReady={page.proofs.health && page.proofs.smoke}
        pendingRollback={page.pendingRollback}
        onOpenVerify={() => page.goToStage("verify")}
        onConfirmRollback={() => void page.confirmRollback()}
        onCancelRollback={() => page.setPendingRollback(null)}
      />
    </div>
  );
}

export default DeploymentDependency;
