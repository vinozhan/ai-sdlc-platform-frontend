import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSessionStore } from "@/store/session";
import { useUiStore } from "@/store/ui";
import { useProject } from "@/entities/project";
import type {
  DeploymentMetrics,
  DeploymentRecord,
  ProviderId,
  ProviderState,
  ReleaseRecord,
  StageId,
} from "../model/types";
import { asRisk } from "../model/risk";
import { stageIndex } from "../model/stages";
import { releaseFiles } from "../fixtures/releaseArtifacts";
import { dependencyUpdatesSeed } from "../fixtures/dependencyUpdates";
import type { PipelineTemplate } from "../components";
import { useDeploymentApi } from "./useDeploymentApi";
import { useEditorTabs } from "@/shared/hooks";

export function useDeploymentPage() {
  const { projectId } = useParams();
  const theme = useUiStore((s) => s.theme);
  const addToast = useUiStore((s) => s.addToast);
  const activeProjectId = useSessionStore((s) => s.activeProjectId);
  const isDark = theme === "dark";
  const project = useProject(activeProjectId ?? projectId);
  const api = useDeploymentApi(project?.id ?? "local");

  const initialStage: StageId =
    project?.status === "complete" || project?.status === "deploy" ? "live" : "connect";

  const [activeStage, setActiveStage] = useState<StageId>(initialStage);
  const [maxStage, setMaxStage] = useState<StageId>(initialStage);
  const [providers, setProviders] = useState<ProviderState[]>([]);
  const [selectedUpdateId, setSelectedUpdateId] = useState(dependencyUpdatesSeed[0].id);
  const [template, setTemplate] = useState<PipelineTemplate>("layered");
  const [deployingId, setDeployingId] = useState<string | null>(null);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [proofs, setProofs] = useState(
    project?.status === "complete" || project?.status === "deploy"
      ? { health: true, smoke: true }
      : { health: false, smoke: false }
  );
  const [gateNote, setGateNote] = useState("");
  const [releases, setReleases] = useState<ReleaseRecord[]>([]);
  const [metrics, setMetrics] = useState<DeploymentMetrics | null>(null);
  const [pendingRollback, setPendingRollback] = useState<string | null>(null);

  const editor = useEditorTabs(releaseFiles[0].path);

  const providersReady = providers.every((p) => p.connected);
  const waitingForTesting = project ? !["deploy", "complete"].includes(project.status) : true;
  const stageBadges = {
    dependencies: dependencyUpdatesSeed.filter((d) => asRisk(d.fusedScore).label !== "auto-apply").length,
    verify: proofs.health && proofs.smoke ? undefined : 1,
  };

  useEffect(() => {
    api.getProviders().then(setProviders);
    api.getDeployments("preview").then(setDeployments);
    api.getReleases().then(setReleases);
    api.getMetrics("prod", "60m").then(setMetrics);
  }, [api]);

  useEffect(() => {
    if (!deployingId) return;
    const stop = api.streamLogs(deployingId, (line) => {
      setLogs((prev) => [...prev, line]);
      setDeployments((prev) =>
        prev.map((d) => {
          if (d.id !== deployingId) return d;
          const nextSteps = [...d.steps];
          if (line.includes("[smoke]")) {
            nextSteps[0] = { ...nextSteps[0], status: "success", duration: "52s" };
            nextSteps[1] = { ...nextSteps[1], status: "running", duration: "41s" };
          } else if (line.includes("[security]")) {
            nextSteps[1] = { ...nextSteps[1], status: "success", duration: "41s" };
            nextSteps[2] = { ...nextSteps[2], status: "running", duration: "38s" };
          } else if (line.includes("preview URL ready")) {
            nextSteps[2] = { ...nextSteps[2], status: "success", duration: "38s" };
            nextSteps[3] = { ...nextSteps[3], status: "success", duration: "36s" };
            d.status = "verified";
            setProofs({ health: true, smoke: true });
            addToast({ type: "success", title: "Preview verified", message: "Health and smoke proofs passed." });
          }
          return { ...d, steps: nextSteps };
        })
      );
    });
    return stop;
  }, [api, deployingId, addToast]);

  const goToStage = (id: StageId) => {
    setActiveStage(id);
    setMaxStage((prev) => (stageIndex[id] > stageIndex[prev] ? id : prev));
  };

  const startDeploy = async () => {
    const { id } = await api.createDeployment("preview");
    const record = await api.getDeployment(id);
    if (!record) return;
    setDeployments((prev) => [record, ...prev]);
    setDeployingId(id);
    setLogs([]);
    setProofs({ health: false, smoke: false });
    goToStage("release");
    addToast({ type: "info", title: "Preview deploy started", message: "Streaming logs are now live." });
  };

  const promote = async () => {
    if (!deployments[0]) return;
    const result = await api.promote(deployments[0].id);
    if (!result.ok) {
      addToast({ type: "error", title: "Promotion blocked", message: result.reason });
      return;
    }
    addToast({ type: "success", title: "Promoted to production", message: "Release is now live." });
    goToStage("live");
  };

  const requestChanges = () => {
    if (!gateNote.trim()) {
      addToast({ type: "warning", title: "Note required", message: "Add a reason before requesting changes." });
      return;
    }
    addToast({ type: "warning", title: "Changes requested", message: gateNote });
    setGateNote("");
  };

  const confirmRollback = async () => {
    if (!pendingRollback) return;
    const res = await api.rollback(pendingRollback);
    addToast({
      type: res.ok ? "warning" : "error",
      title: res.ok ? "Rollback started" : "Rollback failed",
      message: res.ok ? `Returning to ${pendingRollback}.` : "Target release is not verified.",
    });
    setPendingRollback(null);
  };

  const connectProvider = async (providerId: ProviderId) => {
    await api.connectProvider(providerId);
    setProviders(await api.getProviders());
  };

  const applyDependency = (pkg: string) => {
    addToast({ type: "info", title: "Dependency decision", message: `${pkg} marked for apply.` });
  };

  const revertDependency = (pkg: string) => {
    addToast({ type: "warning", title: "Dependency held", message: `${pkg} held back.` });
  };

  const progressId: StageId = waitingForTesting ? "connect" : maxStage;
  const phaseProgress = waitingForTesting ? 0 : Math.round((stageIndex[maxStage] / 5) * 100);

  return {
    isDark,
    waitingForTesting,
    phaseProgress,
    stageBadges,
    progressId,
    activeStage,
    goToStage,
    providers,
    connectProvider,
    selectedUpdateId,
    setSelectedUpdateId,
    applyDependency,
    revertDependency,
    editor,
    template,
    setTemplate,
    startDeploy,
    providersReady,
    deployments,
    logs,
    proofs,
    gateNote,
    setGateNote,
    requestChanges,
    promote,
    metrics,
    releases,
    setPendingRollback,
    pendingRollback,
    confirmRollback,
  };
}
