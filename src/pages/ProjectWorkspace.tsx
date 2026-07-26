import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useParams, useLocation } from "react-router-dom";
import {
  ArrowUp,
  Code2,
  FileText,
  FlaskConical,
  GitBranch,
  Loader2,
  Mic,
  Paperclip,
  Rocket,
  Sparkles,
  Upload,
  Network,
  Layers,
  LayoutGrid,
  Calendar,
  User,
  Database,
  Box,
  AlertCircle,
} from "lucide-react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { useStore, type Project, type ReqPhase } from "@/store/useStore";
import {
  extractedEntities,
  architecturePatterns,
  umlDiagrams,
  sagNodes,
  sagEdges,
  backlog,
  sprintData,
} from "@/data/mockData";
import { cn } from "@/utils/cn";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CodeBlock,
  Progress,
  Tabs,
} from "@/components/ui/primitives";
import { ChevronStepper } from "@/components/ui/ChevronStepper";
import { CodeGeneration } from "@/pages/CodeGeneration";
import { TestingSecurity } from "@/pages/TestingSecurity";
import { DeploymentDependency } from "@/pages/DeploymentDependency";
import { Traceability } from "@/pages/Traceability";

const phaseMeta: { id: ReqPhase; label: string }[] = [
  { id: "input", label: "Input" },
  { id: "parsing", label: "Parsing" },
  { id: "entities", label: "Entities" },
  { id: "sag", label: "SAG Graph" },
  { id: "architecture", label: "Architecture" },
  { id: "uml", label: "UML" },
  { id: "wireframes", label: "Wireframes" },
  { id: "sprint", label: "Sprint" },
  { id: "done", label: "Done" },
];

const nodeColors: Record<string, string> = {
  actor: "#22c55e",
  entity: "#3b82f6",
  module: "#2563eb",
  constraint: "#f97316",
};

const nodeIcons: Record<string, typeof User> = {
  actor: User,
  entity: Database,
  module: Box,
  constraint: AlertCircle,
};

function SAGNodeComponent({ data }: NodeProps) {
  const Icon = nodeIcons[data.type as string] ?? Box;
  const color = nodeColors[data.type as string] ?? "#64748b";
  return (
    <div className="rounded-lg border-2 bg-slate-900 px-3 py-2 shadow-lg" style={{ borderColor: color, minWidth: 110 }}>
      <Handle type="target" position={Position.Left} style={{ background: color }} />
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" style={{ color }} />
        <span className="text-xs font-medium text-white">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: color }} />
    </div>
  );
}

const nodeTypes = { sag: SAGNodeComponent };

function statusBadge(status: Project["status"]) {
  switch (status) {
    case "draft":
      return { label: "Draft", variant: "default" as const };
    case "analyzing":
      return { label: "Analyzing", variant: "info" as const };
    case "design":
      return { label: "Design", variant: "c1" as const };
    case "code":
      return { label: "Code", variant: "c2" as const };
    case "testing":
      return { label: "Testing", variant: "c3" as const };
    case "deploy":
      return { label: "Deploy", variant: "c4" as const };
    case "complete":
      return { label: "Complete", variant: "success" as const };
    default:
      return { label: status, variant: "default" as const };
  }
}

function useProject() {
  const { projectId } = useParams();
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  return { projectId: projectId!, project };
}

function ProjectShell({ children }: { children: React.ReactNode }) {
  const { project, projectId } = useProject();
  const { theme } = useStore();
  const isDark = theme === "dark";
  const location = useLocation();
  const locationPath = location.pathname;

  if (!project) return <Navigate to="/projects" replace />;

  const tabs = [
    { id: "requirements", label: "Requirements & Design", path: `/projects/${projectId}/requirements`, icon: FileText },
    { id: "code", label: "Code Generation", path: `/projects/${projectId}/code`, icon: Code2 },
    { id: "testing", label: "Testing & Security", path: `/projects/${projectId}/testing`, icon: FlaskConical },
    { id: "deployment", label: "Deployment", path: `/projects/${projectId}/deployment`, icon: Rocket },
    { id: "traceability", label: "Traceability", path: `/projects/${projectId}/traceability`, icon: GitBranch },
  ];

  const status = statusBadge(project.status);
  const description =
    project.description.trim() ||
    "AI-assisted SDLC pipeline from requirements through design, code, testing, and deployment.";

  return (
    <div className="flex min-h-full flex-col">
      {/* Main project header */}
      <div
        className={cn(
          "border-b px-6 py-5 md:px-8",
          isDark ? "border-white/[0.06] bg-[#0a1628]/40" : "border-slate-200/80 bg-white/80"
        )}
      >
        <div className="flex flex-wrap items-start gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-md"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className={cn("text-xl font-semibold tracking-tight md:text-2xl", isDark ? "text-white" : "text-slate-900")}>
                {project.name}
              </h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className={cn("mt-1.5 max-w-3xl text-sm leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>
              {description}
            </p>
            {project.techStack.length > 0 && (
              <p className={cn("mt-2 text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                {project.techStack.join(" · ")}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className={cn("text-2xl font-bold tabular-nums", isDark ? "text-white" : "text-slate-900")}>
              {project.progress}%
            </p>
            <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>Overall progress</p>
          </div>
        </div>
      </div>

      {/* Component tabs */}
      <div
        className={cn(
          "sticky top-0 z-20 border-b px-6 py-2 backdrop-blur-xl md:px-8",
          isDark ? "border-white/[0.06] bg-[#071018]/95" : "border-slate-200/80 bg-white/95"
        )}
      >
        <div
          className={cn(
            "inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl p-1",
            isDark ? "bg-white/[0.04] ring-1 ring-white/[0.06]" : "border border-slate-200 bg-slate-50/80"
          )}
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = locationPath.includes(`/${t.id}`);
            return (
              <Link
                key={t.id}
                to={t.path}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all",
                  active
                    ? isDark
                      ? "bg-white/10 text-white shadow-sm"
                      : "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                    : isDark
                    ? "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                    : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active && (isDark ? "text-blue-400" : "text-blue-600"))} />
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}

function RequirementsInput({
  project,
  onSubmit,
}: {
  project: Project;
  onSubmit: (text: string, files: string[]) => void;
}) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  const [text, setText] = useState(project.requirementText);
  const [files, setFiles] = useState<string[]>(project.files);
  const fileRef = useRef<HTMLInputElement>(null);

  const examples = [
    "Build a digital banking platform with payments, KYC, and transaction history.",
    "Create an inventory API with stock levels, suppliers, and low-stock alerts.",
    "Design a notification service supporting email, SMS, and push channels.",
  ];

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <div
          className={cn(
            "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl",
            isDark ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-600"
          )}
        >
          <FileText className="h-6 w-6" />
        </div>
        <h3 className={cn("text-2xl font-semibold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
          What should {project.name} do?
        </h3>
        <p className={cn("mt-2 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
          Paste natural language requirements, user stories, or upload an SRS. We’ll generate design artifacts automatically.
        </p>
      </div>

      <div
        className={cn(
          "w-full rounded-2xl border-2 p-4 shadow-sm transition-all focus-within:shadow-md",
          isDark
            ? "border-blue-500/40 bg-[#0f1d32]/80 focus-within:border-blue-400"
            : "border-blue-400 bg-white focus-within:border-blue-500"
        )}
      >
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && text.trim()) {
              onSubmit(text.trim(), files);
            }
          }}
          rows={5}
          placeholder="Describe features, actors, constraints, integrations..."
          className={cn(
            "w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-slate-400",
            isDark ? "text-slate-100" : "text-slate-800"
          )}
        />

        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map((f) => (
              <span
                key={f}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs",
                  isDark ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-600"
                )}
              >
                <Upload className="h-3 w-3" />
                {f}
                <button
                  onClick={() => setFiles((prev) => prev.filter((x) => x !== f))}
                  className="ml-1 opacity-60 hover:opacity-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={(e) => {
                const names = Array.from(e.target.files || []).map((f) => f.name);
                if (names.length) setFiles((prev) => [...prev, ...names]);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"
              )}
              title="Attach SRS documents"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"
              )}
            >
              <Mic className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("hidden text-[11px] sm:inline", isDark ? "text-slate-500" : "text-slate-400")}>
              ⌘ + Enter
            </span>
            <button
              type="button"
              disabled={!text.trim()}
              onClick={() => text.trim() && onSubmit(text.trim(), files)}
              className={cn(
                "flex h-9 items-center gap-2 rounded-xl px-4 text-sm font-medium text-white transition-colors disabled:opacity-40",
                "bg-blue-500 hover:bg-blue-400"
              )}
            >
              Analyze
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 w-full rounded-xl border border-dashed p-4 text-center text-xs",
          isDark ? "border-white/10 text-slate-500" : "border-slate-200 text-slate-400"
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const names = Array.from(e.dataTransfer.files).map((f) => f.name);
          if (names.length) setFiles((prev) => [...prev, ...names]);
        }}
      >
        Drop SRS / PDF / DOCX here, or use the paperclip to attach
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => setText(ex)}
            className={cn(
              "max-w-xs rounded-full border px-3 py-1.5 text-left text-xs transition-colors",
              isDark
                ? "border-white/10 text-slate-400 hover:bg-white/5"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            )}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

function PhaseStepper({ phase }: { phase: ReqPhase }) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  const steps = phaseMeta.filter((p) => p.id !== "input");

  return <ChevronStepper steps={steps} currentId={phase} isDark={isDark} />;
}

function RequirementsResults({ project }: { project: Project }) {
  const { theme, pipelineRunning } = useStore();
  const isDark = theme === "dark";
  const [view, setView] = useState("entities");

  const unlocked = useMemo(() => {
    const order = ["entities", "sag", "architecture", "uml", "wireframes", "sprint"];
    const phaseMap: Record<string, ReqPhase[]> = {
      entities: ["entities", "sag", "architecture", "uml", "wireframes", "sprint", "done"],
      sag: ["sag", "architecture", "uml", "wireframes", "sprint", "done"],
      architecture: ["architecture", "uml", "wireframes", "sprint", "done"],
      uml: ["uml", "wireframes", "sprint", "done"],
      wireframes: ["wireframes", "sprint", "done"],
      sprint: ["sprint", "done"],
    };
    return order.filter((id) => phaseMap[id]?.includes(project.reqPhase));
  }, [project.reqPhase]);

  useEffect(() => {
    if (unlocked.length && !unlocked.includes(view)) {
      setView(unlocked[unlocked.length - 1]);
    }
  }, [unlocked, view]);

  const tabs = [
    { id: "entities", label: "Entities", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "sag", label: "SAG Graph", icon: <Network className="h-3.5 w-3.5" /> },
    { id: "architecture", label: "Architecture", icon: <Layers className="h-3.5 w-3.5" /> },
    { id: "uml", label: "UML Diagrams", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "wireframes", label: "Wireframes", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
    { id: "sprint", label: "Sprint Plan", icon: <Calendar className="h-3.5 w-3.5" /> },
  ].filter((t) => unlocked.includes(t.id));

  const nodes: Node[] = sagNodes.map((n) => ({
    id: n.id,
    type: "sag",
    position: n.position,
    data: { label: n.label, type: n.type, validated: n.validated },
  }));
  const edges: Edge[] = sagEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true,
    style: { stroke: "#475569", strokeWidth: 1.5 },
    labelStyle: { fill: "#64748b", fontSize: 9 },
  }));

  return (
    <div className="w-full space-y-5 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-slate-900")}>
            Requirements & Design
          </h3>
          <p className={cn("mt-1 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
            {pipelineRunning
              ? "AI is generating design artifacts from your requirements..."
              : "Generated from your requirements input"}
          </p>
        </div>
        <div className="w-48">
          <div className="mb-1 flex justify-between text-xs">
            <span className={isDark ? "text-slate-500" : "text-slate-400"}>Progress</span>
            <span className={isDark ? "text-white" : "text-slate-900"}>{project.progress}%</span>
          </div>
          <Progress value={project.progress} color="#2563eb" />
        </div>
      </div>

      <PhaseStepper phase={project.reqPhase} />

      <Card>
        <CardContent className="p-4">
          <p className={cn("mb-1 text-xs font-semibold uppercase tracking-wide", isDark ? "text-slate-500" : "text-slate-400")}>
            Source requirements
          </p>
          <p className={cn("text-sm leading-relaxed", isDark ? "text-slate-300" : "text-slate-700")}>
            {project.requirementText}
          </p>
          {project.files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {project.files.map((f) => (
                <Badge key={f} variant="default">
                  <Upload className="h-3 w-3" />
                  {f}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {tabs.length > 0 && (
        <>
          <Tabs tabs={tabs} active={view} onChange={setView} />

          {view === "entities" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { title: "Actors", items: extractedEntities.actors, color: "#22c55e" },
                { title: "Entities", items: extractedEntities.entities, color: "#3b82f6" },
                { title: "Actions", items: extractedEntities.actions, color: "#2563eb" },
                { title: "Relationships", items: extractedEntities.relationships, color: "#f97316" },
              ].map((col) => (
                <Card key={col.title}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
                      {col.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {col.items.map((item) => (
                      <div
                        key={item}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-xs",
                          isDark ? "border-white/5 text-slate-300" : "border-slate-100 text-slate-600"
                        )}
                      >
                        {item}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {view === "sag" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-green-500" />
                  Semantic Architecture Graph
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className={cn("h-[480px] w-full", isDark ? "bg-[#0a0e17]" : "bg-slate-50")}>
                  <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.2 }}>
                    <Background color={isDark ? "#1e293b" : "#cbd5e1"} gap={20} />
                    <Controls />
                    <MiniMap
                      nodeColor={(n) => nodeColors[n.data?.type as string] ?? "#64748b"}
                      maskColor={isDark ? "rgba(15,23,42,0.7)" : "rgba(248,250,252,0.7)"}
                    />
                  </ReactFlow>
                </div>
              </CardContent>
            </Card>
          )}

          {view === "architecture" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {architecturePatterns.slice(0, 3).map((p) => (
                <Card key={p.id} className={p.id === "microservices" ? "ring-2 ring-blue-500/40" : undefined}>
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <h4 className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>{p.name}</h4>
                      <Badge variant="c3">{p.confidence}%</Badge>
                    </div>
                    <p className={cn("text-xs leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>
                      {p.explanation}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {p.pros.slice(0, 2).map((pro) => (
                        <Badge key={pro} variant="success">
                          {pro}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {view === "uml" && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {Object.entries(umlDiagrams)
                .slice(0, 4)
                .map(([key, code]) => (
                  <Card key={key}>
                    <CardHeader>
                      <CardTitle className="capitalize">{key} diagram</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CodeBlock code={code} language="mermaid" className="max-h-64" />
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {view === "wireframes" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {["Login", "Dashboard", "Payment Form", "KYC Upload", "Confirmation", "Admin Review"].map((screen) => (
                <Card key={screen}>
                  <CardContent className="p-4">
                    <div
                      className={cn(
                        "mb-3 flex h-36 items-center justify-center rounded-xl border border-dashed",
                        isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50"
                      )}
                    >
                      <LayoutGrid className={cn("h-8 w-8", isDark ? "text-slate-600" : "text-slate-300")} />
                    </div>
                    <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>{screen}</p>
                    <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>Auto-generated wireframe</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {view === "sprint" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: "Sprint", value: sprintData.name },
                  { label: "Points", value: String(sprintData.totalPoints) },
                  { label: "Completed", value: String(sprintData.completedPoints) },
                  { label: "Goal", value: sprintData.goal.slice(0, 28) + "…" },
                ].map((s) => (
                  <Card key={s.label}>
                    <CardContent className="p-4">
                      <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>{s.label}</p>
                      <p className={cn("mt-1 text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>{s.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Backlog</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {backlog.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-3",
                        isDark ? "border-white/5" : "border-slate-100"
                      )}
                    >
                      <span className={cn("font-mono text-[10px]", isDark ? "text-slate-500" : "text-slate-400")}>
                        {item.id}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm", isDark ? "text-slate-200" : "text-slate-800")}>{item.title}</p>
                        <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>{item.epic}</p>
                      </div>
                      <Badge variant="c1">{item.storyPoints} pts</Badge>
                      <Badge variant={item.status === "done" ? "success" : item.status === "in-progress" ? "info" : "default"}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {pipelineRunning && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl",
            isDark ? "border-white/10 bg-[#0f1d32]" : "border-slate-200 bg-white"
          )}
        >
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className={cn("text-sm font-medium", isDark ? "text-slate-200" : "text-slate-700")}>
            Running design pipeline…
          </span>
        </div>
      )}
    </div>
  );
}

function RequirementsPage() {
  const { project, projectId } = useProject();
  const { startRequirementsPipeline, setActiveProjectId } = useStore();

  useEffect(() => {
    if (project) setActiveProjectId(project.id);
  }, [project, setActiveProjectId]);

  if (!project) return <Navigate to="/projects" replace />;

  if (project.reqPhase === "input") {
    return (
      <RequirementsInput
        project={project}
        onSubmit={(text, files) => startRequirementsPipeline(projectId, text, files)}
      />
    );
  }

  return <RequirementsResults project={project} />;
}

export function ProjectWorkspace() {
  return (
    <Routes>
      <Route
        path="requirements"
        element={
          <ProjectShell>
            <RequirementsPage />
          </ProjectShell>
        }
      />
      <Route
        path="code"
        element={
          <ProjectShell>
            <div className="p-2">
              <CodeGeneration />
            </div>
          </ProjectShell>
        }
      />
      <Route
        path="testing"
        element={
          <ProjectShell>
            <div className="p-2">
              <TestingSecurity />
            </div>
          </ProjectShell>
        }
      />
      <Route
        path="deployment"
        element={
          <ProjectShell>
            <div className="p-2">
              <DeploymentDependency />
            </div>
          </ProjectShell>
        }
      />
      <Route
        path="traceability"
        element={
          <ProjectShell>
            <div className="p-2">
              <Traceability />
            </div>
          </ProjectShell>
        }
      />
      <Route path="*" element={<Navigate to="requirements" replace />} />
    </Routes>
  );
}
