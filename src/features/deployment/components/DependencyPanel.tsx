import { ArrowUpCircle, Package, RotateCcw } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives";
import { cn } from "@/shared/utils/cn";
import { dependencyUpdatesSeed } from "../fixtures/dependencyUpdates";
import { asRisk } from "../model/risk";

type DependencyPanelProps = {
  selectedUpdateId: string;
  onSelectUpdate: (id: string) => void;
  onApply: (pkg: string) => void;
  onRevert: (pkg: string) => void;
};

export function DependencyPanel({
  selectedUpdateId,
  onSelectUpdate,
  onApply,
  onRevert,
}: DependencyPanelProps) {
  const selectedUpdate =
    dependencyUpdatesSeed.find((d) => d.id === selectedUpdateId) ?? dependencyUpdatesSeed[0];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4 text-orange-400" />
            Pre-flight updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {dependencyUpdatesSeed.map((d) => {
            const risk = asRisk(d.fusedScore);
            return (
              <button
                key={d.id}
                onClick={() => onSelectUpdate(d.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left",
                  selectedUpdateId === d.id
                    ? "border-orange-500/40 bg-orange-500/5"
                    : "border-slate-800 dark:border-white/10"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{d.pkg}</span>
                  <Badge variant={risk.badge}>{d.fusedScore}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {d.from} to {d.to}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant={d.semver === "major" ? "error" : d.semver === "minor" ? "warning" : "success"}>
                    {d.semver}
                  </Badge>
                  <Badge variant={risk.badge}>{risk.label}</Badge>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{selectedUpdate.pkg}</CardTitle>
            <Badge variant={asRisk(selectedUpdate.fusedScore).badge}>
              {asRisk(selectedUpdate.fusedScore).label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800 p-3 text-center dark:border-white/10">
              <p className="text-xs text-slate-500">Rule-based</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedUpdate.ruleScore}</p>
            </div>
            <div className="rounded-xl border border-slate-800 p-3 text-center dark:border-white/10">
              <p className="text-xs text-slate-500">LLM score</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedUpdate.llmScore}</p>
            </div>
            <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-3 text-center">
              <p className="text-xs text-orange-300">Fused risk score</p>
              <p className="text-xl font-bold text-orange-400">{selectedUpdate.fusedScore}</p>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold text-slate-400">AI changelog summary</p>
            <p className="rounded-xl bg-slate-950 p-3 text-xs text-slate-300">{selectedUpdate.changelog}</p>
          </div>

          <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
            <p className="mb-1 text-xs font-semibold text-slate-400">
              Affected functions: {selectedUpdate.affectedFunctions}
            </p>
            {selectedUpdate.impactedFiles.length > 0 ? (
              <div className="space-y-1">
                {selectedUpdate.impactedFiles.map((file) => (
                  <p key={file} className="font-mono text-xs text-slate-300">
                    {file}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-400">No impacted files detected.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
            <p className="mb-1 text-xs font-semibold text-slate-400">Migration guide</p>
            <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-300">
              {selectedUpdate.migrationGuide}
            </pre>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={selectedUpdate.fusedScore > 70 ? "error" : "c4"}
              onClick={() => onApply(selectedUpdate.pkg)}
            >
              <ArrowUpCircle className="h-3 w-3" />
              Apply update
            </Button>
            <Button size="sm" variant="outline" onClick={() => onRevert(selectedUpdate.pkg)}>
              <RotateCcw className="h-3 w-3" />
              Revert
            </Button>
            <span
              title="Time to roll back to last verified release and rerun health and smoke proofs."
              className="ml-auto text-xs text-slate-500"
            >
              Estimated recovery:{" "}
              {selectedUpdate.fusedScore > 70 ? "42 min" : selectedUpdate.fusedScore >= 30 ? "18 min" : "8 min"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
