import { useState } from "react";
import {
  FileText,
  Pencil,
  Code2,
  FlaskConical,
  Rocket,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  GitBranch,
  Zap,
  Clock,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui/primitives";
import { traceabilityArtifacts, traceabilityLinks } from "@/data/mockData";
import { useStore } from "@/store/useStore";
import { cn } from "@/utils/cn";

const stageConfig = [
  { type: "requirement", label: "Requirements", icon: FileText, color: "#22c55e", x: 0 },
  { type: "design", label: "Design", icon: Pencil, color: "#22c55e", x: 200 },
  { type: "development", label: "Development", icon: Code2, color: "#3b82f6", x: 400 },
  { type: "testing", label: "Testing", icon: FlaskConical, color: "#2563eb", x: 600 },
  { type: "deployment", label: "Deployment", icon: Rocket, color: "#f97316", x: 800 },
  { type: "improvement", label: "Continuous Improvement", icon: TrendingUp, color: "#06b6d4", x: 1000 },
];

const statusColors: Record<string, string> = {
  approved: "#22c55e",
  validated: "#3b82f6",
  generated: "#2563eb",
  passing: "#22c55e",
  failing: "#ef4444",
  findings: "#f59e0b",
  running: "#3b82f6",
  healthy: "#22c55e",
  warning: "#f59e0b",
};

export function Traceability() {
  const [selectedArtifact, setSelectedArtifact] = useState<string | null>(null);
  const [showImpact, setShowImpact] = useState(false);
  const { addToast, theme } = useStore();
  const isDark = theme === "dark";

  const selected = traceabilityArtifacts.find((a) => a.id === selectedArtifact);
  const upstream = traceabilityLinks.filter((l) => l.target === selectedArtifact).map((l) => l.source);
  const downstream = traceabilityLinks.filter((l) => l.source === selectedArtifact).map((l) => l.target);

  const getUpstream = (id: string): string[] => {
    const result: string[] = [];
    const visited = new Set<string>();
    const stack = [id];
    while (stack.length > 0) {
      const current = stack.pop()!;
      const ups = traceabilityLinks.filter((l) => l.target === current && !l.feedback).map((l) => l.source);
      for (const u of ups) {
        if (!visited.has(u)) {
          visited.add(u);
          result.push(u);
          stack.push(u);
        }
      }
    }
    return result;
  };

  const getDownstream = (id: string): string[] => {
    const result: string[] = [];
    const visited = new Set<string>();
    const stack = [id];
    while (stack.length > 0) {
      const current = stack.pop()!;
      const downs = traceabilityLinks.filter((l) => l.source === current && !l.feedback).map((l) => l.target);
      for (const d of downs) {
        if (!visited.has(d)) {
          visited.add(d);
          result.push(d);
          stack.push(d);
        }
      }
    }
    return result;
  };

  const impactedIds = selectedArtifact ? [...getUpstream(selectedArtifact), ...getDownstream(selectedArtifact), selectedArtifact] : [];

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
          Follow artifacts across requirements, design, code, testing, and release.
        </p>
        <Button
          variant={showImpact ? "primary" : "outline"}
          size="sm"
          onClick={() => setShowImpact(!showImpact)}
        >
          <Zap className="h-3.5 w-3.5" /> {showImpact ? "Hide impact" : "Show impact"}
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Graph Canvas */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-cyan-400" />
              SDLC Artifact Graph
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative h-[600px] overflow-auto rounded-b-xl bg-slate-950">
              {/* Stage headers */}
              <div className="sticky top-0 z-10 flex border-b border-slate-800 bg-slate-950/90 backdrop-blur">
                {stageConfig.map((stage) => {
                  const Icon = stage.icon;
                  return (
                    <div
                      key={stage.type}
                      className="flex flex-1 items-center gap-2 border-r border-slate-800 px-4 py-2 last:border-r-0"
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: stage.color }} />
                      <span className="text-xs font-medium text-slate-300">{stage.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* SVG for links */}
              <svg className="absolute inset-0 h-full w-full" style={{ minWidth: 1200 }}>
                {traceabilityLinks.map((link) => {
                  const source = traceabilityArtifacts.find((a) => a.id === link.source);
                  const target = traceabilityArtifacts.find((a) => a.id === link.target);
                  if (!source || !target) return null;
                  const sourceX = source.x + 80;
                  const sourceY = source.y + 20;
                  const targetX = target.x;
                  const targetY = target.y + 20;
                  const isImpacted = showImpact && impactedIds.includes(link.source) && impactedIds.includes(link.target);
                  const isFeedback = link.feedback;
                  return (
                    <g key={link.source + link.target}>
                      <line
                        x1={sourceX}
                        y1={sourceY}
                        x2={targetX}
                        y2={targetY}
                        stroke={isFeedback ? "#06b6d4" : isImpacted ? "#f97316" : "#334155"}
                        strokeWidth={isImpacted || isFeedback ? 2 : 1}
                        strokeDasharray={isFeedback ? "6 4" : "none"}
                        className={isFeedback ? "animate-flow" : ""}
                        opacity={showImpact && !isImpacted && !isFeedback ? 0.15 : 0.6}
                      />
                      {isFeedback && (
                        <polygon
                          points={`${targetX},${targetY} ${targetX - 6},${targetY - 4} ${targetX - 6},${targetY + 4}`}
                          fill="#06b6d4"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Artifact nodes */}
              <div className="relative" style={{ minWidth: 1200, minHeight: 600 }}>
                {traceabilityArtifacts.map((artifact) => {
                  const isSelected = selectedArtifact === artifact.id;
                  const isImpacted = showImpact && impactedIds.includes(artifact.id);
                  const color = statusColors[artifact.status] ?? "#64748b";
                  return (
                    <button
                      key={artifact.id}
                      onClick={() => setSelectedArtifact(isSelected ? null : artifact.id)}
                      className={cn(
                        "absolute flex w-[140px] flex-col rounded-lg border-2 p-2 text-left transition-all",
                        isSelected ? "scale-105 shadow-lg" : "hover:scale-102",
                        showImpact && !isImpacted && !isSelected && "opacity-30"
                      )}
                      style={{
                        left: artifact.x,
                        top: artifact.y,
                        borderColor: isSelected ? "#fff" : isImpacted ? "#f97316" : color,
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="truncate text-[10px] font-medium text-slate-200">{artifact.label}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[9px] uppercase text-slate-500">{artifact.type}</span>
                        <span className="text-[9px] capitalize" style={{ color }}>
                          {artifact.status}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Artifact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selected ? (
              <>
                <div className="rounded-lg border border-slate-800 p-3">
                  <p className="text-xs text-slate-500">Selected Artifact</p>
                  <p className="text-sm font-semibold text-white">{selected.label}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="default">{selected.type}</Badge>
                    <Badge
                      variant={
                        selected.status === "failing" || selected.status === "findings"
                          ? "error"
                          : selected.status === "warning"
                          ? "warning"
                          : "success"
                      }
                    >
                      {selected.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-400">
                    <ArrowLeft className="mr-1 inline h-3 w-3" />
                    Upstream ({upstream.length})
                  </p>
                  <div className="space-y-1">
                    {upstream.length > 0 ? (
                      upstream.map((id) => {
                        const a = traceabilityArtifacts.find((x) => x.id === id);
                        return (
                          <button
                            key={id}
                            onClick={() => setSelectedArtifact(id)}
                            className="flex w-full items-center gap-2 rounded bg-slate-800/50 px-2 py-1 text-left text-xs text-slate-300 hover:bg-slate-800"
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColors[a?.status ?? ""] }} />
                            {a?.label}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-600">No upstream artifacts</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-400">
                    <ArrowRight className="mr-1 inline h-3 w-3" />
                    Downstream ({downstream.length})
                  </p>
                  <div className="space-y-1">
                    {downstream.length > 0 ? (
                      downstream.map((id) => {
                        const a = traceabilityArtifacts.find((x) => x.id === id);
                        return (
                          <button
                            key={id}
                            onClick={() => setSelectedArtifact(id)}
                            className="flex w-full items-center gap-2 rounded bg-slate-800/50 px-2 py-1 text-left text-xs text-slate-300 hover:bg-slate-800"
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColors[a?.status ?? ""] }} />
                            {a?.label}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-600">No downstream artifacts</p>
                    )}
                  </div>
                </div>

                {showImpact && (
                  <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3">
                    <p className="mb-1 text-xs font-semibold text-orange-300">
                      <Zap className="mr-1 inline h-3 w-3" />
                      Impact Propagation
                    </p>
                    <p className="text-xs text-slate-300">
                      Change to this artifact impacts {getDownstream(selected.id).length} downstream artifacts.
                      {getUpstream(selected.id).length > 0 && ` ${getUpstream(selected.id).length} upstream dependencies.`}
                    </p>
                    <Button
                      variant="c4"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => addToast({ type: "warning", title: "Regeneration triggered", message: "Selective regeneration started for impacted artifacts" })}
                    >
                      <RotateCcw className="h-3 w-3" /> Selective Regeneration
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <GitBranch className="mx-auto h-8 w-8 text-slate-600" />
                <p className="mt-2 text-sm text-slate-500">Select an artifact to view traceability</p>
                <p className="mt-1 text-xs text-slate-600">Click any node in the graph</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Loops */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            AI Feedback Loops
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-blue-400" />
                <ArrowRight className="h-4 w-4 text-cyan-400" />
                <Code2 className="h-5 w-5 text-blue-400" />
              </div>
              <p className="mt-2 text-sm font-medium text-white">Testing → Code Generation</p>
              <p className="mt-1 text-xs text-slate-400">
                Test findings and bug reports automatically feed back to code generation for bug fixes and test repair.
                2 failing tests currently triggering code review.
              </p>
              <Badge variant="c3" className="mt-2">
                <Clock className="h-3 w-3" /> Active
              </Badge>
            </div>
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-orange-400" />
                <ArrowRight className="h-4 w-4 text-cyan-400" />
                <FileText className="h-5 w-5 text-green-400" />
              </div>
              <p className="mt-2 text-sm font-medium text-white">Deployment → Requirements</p>
              <p className="mt-1 text-xs text-slate-400">
                Deployment risk analysis and production metrics feed into next sprint planning.
                3 dependency risks flagged for requirements review.
              </p>
              <Badge variant="c4" className="mt-2">
                <Clock className="h-3 w-3" /> Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-3">
          <span className="text-xs font-semibold text-slate-400">Legend:</span>
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs capitalize text-slate-400">{status}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-6 bg-cyan-400" style={{ backgroundImage: "repeating-linear-gradient(90deg, #06b6d4 0, #06b6d4 4px, transparent 4px, transparent 8px)" }} />
            <span className="text-xs text-slate-400">Feedback Loop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-6 bg-orange-400" />
            <span className="text-xs text-slate-400">Impact Propagation</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
