import type { ReactNode } from "react";
import { Play, RefreshCw, Sparkles } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives";
import { cn } from "@/shared/utils/cn";
import type { DeploymentRecord } from "../model/types";

export type PipelineTemplate = "single" | "layered" | "parallel";

type ReleaseActionsProps = {
  artifactBrowser: ReactNode;
  template: PipelineTemplate;
  onTemplateChange: (template: PipelineTemplate) => void;
  onStartDeploy: () => void;
  providersReady: boolean;
  waitingForTesting: boolean;
  deployments: DeploymentRecord[];
  logs: string[];
};

const TEMPLATES: { id: PipelineTemplate; label: string; note: string }[] = [
  { id: "single", label: "single service", note: "One pipeline for full stack." },
  { id: "layered", label: "per layer", note: "Frontend and backend split." },
  { id: "parallel", label: "parallel", note: "Build and scan in parallel." },
];

export function ReleaseActions({
  artifactBrowser,
  template,
  onTemplateChange,
  onStartDeploy,
  providersReady,
  waitingForTesting,
  deployments,
  logs,
}: ReleaseActionsProps) {
  const latest = deployments[0];
  const failed = latest?.status === "failed";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {artifactBrowser}

        <Card>
          <CardHeader>
            <CardTitle>Pipeline template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {TEMPLATES.map((item) => (
              <button
                key={item.id}
                onClick={() => onTemplateChange(item.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left",
                  template === item.id
                    ? "border-orange-500/40 bg-orange-500/5"
                    : "border-slate-800 dark:border-white/10"
                )}
              >
                <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-slate-500">{item.note}</p>
              </button>
            ))}
            <Button
              className="w-full"
              variant="c4"
              onClick={onStartDeploy}
              disabled={!providersReady || waitingForTesting}
            >
              <Play className="h-3 w-3" />
              Start preview deploy
            </Button>
            {!providersReady && (
              <p className="text-xs text-amber-400">Waiting on provider connections from Connect.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-400" />
            Pipeline execution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {(latest?.steps ?? []).map((step) => (
              <div key={step.id} className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{step.name}</p>
                <p className="mt-1 text-xs text-slate-500">{step.duration}</p>
                <Badge
                  className="mt-2"
                  variant={
                    step.status === "success"
                      ? "success"
                      : step.status === "running"
                        ? "warning"
                        : step.status === "failed"
                          ? "error"
                          : "default"
                  }
                >
                  {step.status}
                </Badge>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300 dark:border-white/10">
            {logs.length === 0 ? (
              <p className="text-slate-500">No deploy logs yet.</p>
            ) : (
              logs.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)
            )}
          </div>
        </CardContent>
      </Card>

      {failed && (
        <Card className="border-red-500/30">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-red-300">
                Deploy failed at step: {latest.steps.find((s) => s.status === "failed")?.name}
              </p>
              <p className="text-xs text-slate-400">
                Log excerpt: failed to validate CORS wiring against production domain.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={onStartDeploy}>
              <RefreshCw className="h-3 w-3" />
              Retry step
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
