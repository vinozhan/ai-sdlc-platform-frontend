import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useParams, useLocation } from "react-router-dom";
import {
  ArrowUp,
  CheckCircle2,
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
  module: "#8b5cf6",
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
    { id: "requirements", label: "Requirements", path: `/projects/${projectId}/requirements`, icon: FileText },
    { id: "code", label: "Code", path: `/projects/${projectId}/code`, icon: Code2 },
    { id: "testing", label: "Testing", path: `/projects/${projectId}/testing`, icon: FlaskConical },
    { id: "deployment", label: "Deployment", path: `/projects/${projectId}/deployment`, icon: Rocket },
    { id: "traceability", label: "Traceability", path: `/projects/${projectId}/traceability`, icon: GitBranch },
  ];

  return (
    <div className="flex min-h-full flex-col">
      <div
        className={cn(
          "sticky top-0 z-20 border-b px-6 py-3 backdrop-blur-xl",
          isDark ? "border-white/[0.06] bg-[#070a12]/92" : "border-slate-200/80 bg-[#f4f5f7]/92"
        )}
      >
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: project.color }}
              >
                {project.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className={cn("truncate text-base font-semibold", isDark ? "text-white" : "text-slate-900")}>
                    {project.name}
                  </h2>
                  <Badge variant="default" className="capitalize">
                    {project.status}
                  </Badge>
                </div>
                <p className={cn("mt-0.5 text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                  {project.progress}% complete
                  {project.techStack.length > 0 && ` · ${project.techStack.join(" · ")}`}
                </p>
              </div>
            </div>
          </div>
          <div
            className={cn(
              "flex gap-1 rounded-2xl p-1 shadow-sm",
              isDark ? "bg-white/[0.04] ring-1 ring-white/[0.06]" : "border border-slate-200 bg-white"
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
                    "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                    active
                      ? isDark
                        ? "bg-white/10 text-white shadow-sm"
                        : "bg-slate-900 text-white shadow-sm"
                      : isDark
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="mt-3 w-full">
          <div className={cn("h-1 overflow-hidden rounded-full", isDark ? "bg-white/10" : "bg-slate-200")}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
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
            isDark ? "bg-violet-500/15 text-violet-300" : "bg-violet-50 text-violet-600"
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
            ? "border-violet-500/40 bg-[#121826]/80 focus-within:border-violet-400"
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
                "bg-violet-500 hover:bg-violet-400"
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
  const idx = phaseMeta.findIndex((p) => p.id === phase);

  return (
    <div className="mb-6 flex flex-wrap gap-1.5">
      {phaseMeta.filter((p) => p.id !== "input").map((p, i) => {
        const done = i < idx || phase === "done";
        const active = p.id === phase;
        return (
          <div
            key={p.id}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
              done && !active && (isDark ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-700"),
              active && (isDark ? "border-violet-500/40 bg-violet-500/15 text-violet-200" : "border-violet-200 bg-violet-50 text-violet-700"),
              !done && !active && (isDark ? "border-white/10 text-slate-500" : "border-slate-200 text-slate-400")
            )}
          >
            {done && !active ? <CheckCircle2 className="h-3 w-3" /> : active ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            {p.label}
          </div>
        );
      })}
    </div>
  );
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
          <Progress value={project.progress} color="#8b5cf6" />
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
                { title: "Actions", items: extractedEntities.actions, color: "#8b5cf6" },
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
                <Card key={p.id} className={p.id === "microservices" ? "ring-2 ring-violet-500/40" : undefined}>
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
            isDark ? "border-white/10 bg-[#121826]" : "border-slate-200 bg-white"
          )}
        >
          <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
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
