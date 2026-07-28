import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { ProjectStatus } from "@/store/useStore";
import {
  GitBranch,
  Package,
  AlertTriangle,
  CheckCircle2,
  Rocket,
  Shield,
  Hammer,
  FlaskConical,
  Activity,
  Clock,
  ChevronDown,
  ChevronRight,
  FolderTree,
  FileCode2,
  Server,
  Database,
  ArrowUpCircle,
  History,
  Cpu,
  Zap,
  GitCompare,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Archive,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui/primitives";
import { PhaseSectionHeader, getPhaseProgress } from "@/components/project/PhaseSectionHeader";
import { ChevronStepper } from "@/components/ui/ChevronStepper";
import { repositories, dependencyTree, dependencyUpdates, pipelineStages, deploymentTargets, productionMetrics } from "@/data/mockData";
import { useStore } from "@/store/useStore";
import { cn } from "@/utils/cn";

const deploymentPhaseSteps = [
  { id: "repos", label: "Repositories" },
  { id: "prediction", label: "Dependencies" },
  { id: "pipeline", label: "Pipeline" },
  { id: "monitor", label: "Monitor" },
];

function getDeploymentProgressId(status: ProjectStatus): string {
  switch (status) {
    case "complete":
      return "done";
    case "deploy":
      return "monitor";
    default:
      return "repos";
  }
}

interface DepTreeNode {
  name: string;
  version?: string;
  children?: DepTreeNode[];
}

function RepositoryManager() {
  const [expanded, setExpanded] = useState<string | null>("spring-boot-starter-web");

  const renderTree = (node: DepTreeNode, depth = 0) => (
    <div>
      <div
        className="flex items-center gap-2 rounded py-1 hover:bg-slate-800/50"
        style={{ paddingLeft: depth * 16 + 8 }}
      >
        {node.children ? (
          <button onClick={() => setExpanded(expanded === node.name ? null : node.name)}>
            {expanded === node.name ? <ChevronDown className="h-3 w-3 text-slate-500" /> : <ChevronRight className="h-3 w-3 text-slate-500" />}
          </button>
        ) : (
          <span className="w-3" />
        )}
        <FolderTree className="h-3.5 w-3.5 text-orange-400" />
        <span className="text-xs text-slate-300">{node.name}</span>
        {node.version && <Badge variant="default">{node.version}</Badge>}
      </div>
      {node.children && expanded === node.name && (
        <div>{node.children.map((child) => renderTree(child, depth + 1))}</div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-orange-400" />
            Connected Repositories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {repositories.map((repo) => (
            <div key={repo.id} className="rounded-lg border border-slate-800 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-white">{repo.name}</span>
                  <Badge variant="default">
                    <GitBranch className="h-3 w-3" /> {repo.branch}
                  </Badge>
                </div>
                <Badge variant="success">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-500">Stack:</span>
                {repo.techStack.map((tech) => (
                  <span key={tech} className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                    {tech}
                  </span>
                ))}
                <span className="ml-auto text-xs text-slate-500">Last commit: {repo.lastCommit}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-slate-500">Architecture:</span>
                <Badge variant="c4">{repo.structure}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-orange-400" />
            Dependency Tree
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[400px] overflow-auto">
          {renderTree(dependencyTree)}
        </CardContent>
      </Card>
    </div>
  );
}

function BreakingChangePrediction() {
  const [selectedUpdate, setSelectedUpdate] = useState(dependencyUpdates[1]);
  const { addToast } = useStore();

  const riskColor: Record<string, string> = {
    low: "#10b981",
    medium: "#f59e0b",
    high: "#ef4444",
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4 text-orange-400" />
            Dependency Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {dependencyUpdates.map((update) => (
            <button
              key={update.id}
              onClick={() => setSelectedUpdate(update)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors",
                selectedUpdate.id === update.id ? "border-orange-500/40 bg-orange-500/5" : "border-slate-800 hover:border-slate-700"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{update.package}</span>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: riskColor[update.risk] }}
                />
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <span className="font-mono">{update.currentVersion}</span>
                <ArrowUpCircle className="h-3 w-3 text-orange-400" />
                <span className="font-mono text-orange-400">{update.proposedVersion}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <Badge variant={update.semver === "major" ? "error" : update.semver === "minor" ? "warning" : "success"}>
                  {update.semver}
                </Badge>
                <span className="text-xs font-bold" style={{ color: riskColor[update.risk] }}>
                  {update.probability}% risk
                </span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="font-mono text-sm">{selectedUpdate.package}</CardTitle>
            <Badge variant={selectedUpdate.risk === "high" ? "error" : selectedUpdate.risk === "medium" ? "warning" : "success"}>
              {selectedUpdate.risk.toUpperCase()} RISK
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-800 p-3 text-center">
              <p className="text-xs text-slate-500">Rule-Based</p>
              <p className="text-xl font-bold text-blue-400">{selectedUpdate.ruleScore}%</p>
            </div>
            <div className="rounded-lg border border-slate-800 p-3 text-center">
              <p className="text-xs text-slate-500">LLM Reasoning</p>
              <p className="text-xl font-bold text-blue-400">{selectedUpdate.llmScore}%</p>
            </div>
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 text-center">
              <p className="text-xs text-orange-300">Fused Score</p>
              <p className="text-xl font-bold text-orange-400">{selectedUpdate.fusedScore}%</p>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold text-slate-400">🤖 Changelog Summary (AI-extracted)</p>
            <p className="rounded-lg bg-slate-950 p-3 text-xs text-slate-300">{selectedUpdate.changelog}</p>
          </div>

          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
            <p className="mb-2 text-xs font-semibold text-red-300">
              📍 Client Contextual Analysis - {selectedUpdate.affectedFunctions} affected functions
            </p>
            {selectedUpdate.impactedFiles.length > 0 ? (
              <div className="space-y-1">
                {selectedUpdate.impactedFiles.map((file) => (
                  <div key={file} className="flex items-center gap-2 text-xs">
                    <FileCode2 className="h-3 w-3 text-slate-500" />
                    <span className="font-mono text-slate-300">{file}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-400">No affected files detected</p>
            )}
          </div>

          <div className="rounded-lg border border-slate-800 p-3">
            <p className="mb-1 text-xs font-semibold text-slate-400">Migration Guide</p>
            <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-300">{selectedUpdate.migrationGuide}</pre>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={selectedUpdate.risk === "high" ? "error" : "c4"}
              size="sm"
              onClick={() => addToast({ type: "warning", title: "Update scheduled", message: `${selectedUpdate.package} update queued` })}
            >
              <Rocket className="h-3 w-3" /> Apply Update
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addToast({ type: "info", title: "Rollback prepared", message: `Revert to ${selectedUpdate.currentVersion}` })}
            >
              <RotateCcw className="h-3 w-3" /> Revert to {selectedUpdate.currentVersion}
            </Button>
            <div className="ml-auto flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              Est. recovery: {selectedUpdate.risk === "high" ? "45 min" : selectedUpdate.risk === "medium" ? "15 min" : "5 min"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DeploymentPipeline() {
  const stageIcons: Record<string, typeof Hammer> = {
    hammer: Hammer,
    flask: FlaskConical,
    shield: Shield,
    rocket: Rocket,
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-orange-400" />
            CI/CD Pipeline - GitHub Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="-mx-2 overflow-x-auto px-2 pb-1">
          <div className="flex min-w-[560px] items-center gap-2">
            {pipelineStages.map((stage, i) => {
              const Icon = stageIcons[stage.icon];
              return (
                <div key={stage.id} className="flex flex-1 items-center gap-2">
                  <div
                    className={cn(
                      "flex flex-1 flex-col items-center rounded-xl border p-4",
                      stage.status === "success" && "border-emerald-500/30 bg-emerald-500/5",
                      stage.status === "running" && "border-orange-500/30 bg-orange-500/5",
                      stage.status === "failed" && "border-red-500/30 bg-red-500/5"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6",
                        stage.status === "success" && "text-emerald-400",
                        stage.status === "running" && "text-orange-400 animate-pulse",
                        stage.status === "failed" && "text-red-400"
                      )}
                    />
                    <p className="mt-2 text-sm font-medium text-white">{stage.name}</p>
                    <p className="text-xs text-slate-500">{stage.duration}</p>
                    <div className="mt-1">
                      {stage.status === "success" && <Badge variant="success">Success</Badge>}
                      {stage.status === "running" && <Badge variant="warning">Running</Badge>}
                      {stage.status === "failed" && <Badge variant="error">Failed</Badge>}
                    </div>
                  </div>
                  {i < pipelineStages.length - 1 && (
                    <div className={cn("h-px w-4", stage.status === "success" ? "bg-emerald-500/40" : "bg-slate-700")} />
                  )}
                </div>
              );
            })}
          </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-orange-400" />
              Dockerfile / K8s Manifest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-300">
{`FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s \\
  CMD wget -qO- http://localhost:8080/actuator/health
ENTRYPOINT ["java", "-jar", "app.jar"]`}
            </pre>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="success">
                <CheckCircle2 className="h-3 w-3" /> Valid
              </Badge>
              <Badge variant="default">K8s Ready</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-4 w-4 text-orange-400" />
              Deployment Targets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-slate-800 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-slate-800 p-1.5">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full text-white">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Frontend - Vercel</p>
                    <p className="font-mono text-[10px] text-slate-500">{deploymentTargets.frontend.url}</p>
                  </div>
                </div>
                <Badge variant="success">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Healthy
                </Badge>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-slate-500">Uptime</p>
                  <p className="text-sm font-bold text-emerald-400">{deploymentTargets.frontend.uptime}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Response</p>
                  <p className="text-sm font-bold text-white">{deploymentTargets.frontend.responseTime}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="text-sm font-bold text-white">Live</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Backend - Azure AKS</p>
                    <p className="font-mono text-[10px] text-slate-500">{deploymentTargets.backend.url}</p>
                  </div>
                </div>
                <Badge variant="success">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Healthy
                </Badge>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-slate-500">Uptime</p>
                  <p className="text-sm font-bold text-emerald-400">{deploymentTargets.backend.uptime}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Response</p>
                  <p className="text-sm font-bold text-white">{deploymentTargets.backend.responseTime}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="text-sm font-bold text-white">Live</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { name: "Single Service", desc: "Single pipeline for monorepo", icon: Database },
              { name: "Frontend + Backend", desc: "Separate pipelines per layer", icon: GitCompare },
              { name: "Monorepo", desc: "Parallel pipelines with triggers", icon: FolderTree },
            ].map((t) => (
              <div key={t.name} className="rounded-lg border border-slate-800 p-3">
                <t.icon className="h-5 w-5 text-orange-400" />
                <p className="mt-2 text-sm font-medium text-white">{t.name}</p>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DeploymentMonitor() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Uptime</p>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-400">99.97%</p>
            <p className="text-xs text-slate-500">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Avg Response</p>
              <Zap className="h-4 w-4 text-blue-400" />
            </div>
            <p className="mt-1 text-2xl font-bold text-white">142ms</p>
            <p className="text-xs text-slate-500">p95 latency</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Error Rate</p>
              <Activity className="h-4 w-4 text-amber-400" />
            </div>
            <p className="mt-1 text-2xl font-bold text-amber-400">0.02%</p>
            <p className="text-xs text-slate-500">5xx errors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Active Pods</p>
              <Cpu className="h-4 w-4 text-blue-400" />
            </div>
            <p className="mt-1 text-2xl font-bold text-white">12/12</p>
            <p className="text-xs text-slate-500">All healthy</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-400" />
            Production Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productionMetrics}>
                <defs>
                  <linearGradient id="uptimeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="responseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
                <Area type="monotone" dataKey="uptime" stroke="#10b981" fill="url(#uptimeGrad)" strokeWidth={2} name="Uptime %" />
                <Area type="monotone" dataKey="responseTime" stroke="#3b82f6" fill="url(#responseGrad)" strokeWidth={2} name="Response (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-400" />
              Release Notes (AI-parsed)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { version: "v2.4.0", date: "2025-01-20", notes: "Payment refund API updated with new status codes. KYC flow improvements." },
              { version: "v2.3.1", date: "2025-01-15", notes: "Security patch for CVE-2024-1234. Performance improvements to transaction search." },
              { version: "v2.3.0", date: "2025-01-10", notes: "New Apple Pay integration. Dashboard analytics enhancements." },
            ].map((r) => (
              <div key={r.version} className="rounded-lg border border-slate-800 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium text-white">{r.version}</span>
                  <span className="text-xs text-slate-500">{r.date}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{r.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-4 w-4 text-orange-400" />
              Dependency Evolution Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { date: "Jan 20", pkg: "jackson-databind", action: "delayed", risk: "high" },
              { date: "Jan 18", pkg: "tomcat-embed-core", action: "applied", risk: "low" },
              { date: "Jan 15", pkg: "hibernate-core", action: "applied", risk: "low" },
              { date: "Jan 12", pkg: "spring-boot-starter-web", action: "applied", risk: "medium" },
              { date: "Jan 8", pkg: "spring-security-crypto", action: "scheduled", risk: "high" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      item.risk === "high" ? "bg-red-400" : item.risk === "medium" ? "bg-amber-400" : "bg-emerald-400"
                    )}
                  />
                  {i < 4 && <div className="h-6 w-px bg-slate-700" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-white">{item.pkg}</p>
                  <p className="text-[10px] text-slate-500">{item.date}</p>
                </div>
                <Badge variant={item.action === "applied" ? "success" : item.action === "delayed" ? "error" : "warning"}>
                  {item.action}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DeploymentDependency() {
  const { projectId } = useParams();
  const { theme, projects, activeProjectId } = useStore();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("repos");

  const project = useMemo(
    () => projects.find((p) => p.id === (activeProjectId ?? projectId)),
    [projects, activeProjectId, projectId]
  );

  const progressId = project ? getDeploymentProgressId(project.status) : activeTab;

  return (
    <div className="w-full space-y-5 p-4 sm:p-6 md:p-8">
      <PhaseSectionHeader
        title="Deployment & Dependencies"
        subtitle={
          project?.status === "complete"
            ? "All deployment stages complete - browse any step below"
            : "Repository management, dependency updates, CI/CD pipeline, and production monitoring"
        }
        progress={project ? getPhaseProgress(project, "deployment") : 0}
        isDark={isDark}
      />

      <ChevronStepper
        steps={deploymentPhaseSteps}
        progressId={progressId}
        selectedId={activeTab}
        isDark={isDark}
        onStepClick={setActiveTab}
      />

      {activeTab === "repos" && <RepositoryManager />}
      {activeTab === "prediction" && <BreakingChangePrediction />}
      {activeTab === "pipeline" && <DeploymentPipeline />}
      {activeTab === "monitor" && <DeploymentMonitor />}
    </div>
  );
}
