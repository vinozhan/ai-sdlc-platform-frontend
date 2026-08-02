import { Shield } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Progress } from "@/shared/ui/primitives";
import type { DeploymentRecord } from "../model/types";

type VerifyPanelProps = {
  deployments: DeploymentRecord[];
  proofs: { health: boolean; smoke: boolean };
  gateNote: string;
  onGateNoteChange: (value: string) => void;
  onRequestChanges: () => void;
  onPromote: () => void;
};

export function VerifyPanel({
  deployments,
  proofs,
  gateNote,
  onGateNoteChange,
  onRequestChanges,
  onPromote,
}: VerifyPanelProps) {
  const proofsReady = proofs.health && proofs.smoke;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-400" />
            Preview proofs and promotion gate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
            <p className="text-xs text-slate-500">Preview URL</p>
            <p className="font-mono text-xs text-slate-900 dark:text-white">
              {deployments[0]?.previewUrl ?? "No preview deployment yet"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 p-4 dark:border-white/10">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Health check proof</p>
              <p className="mt-1 text-xs text-slate-500">GET /actuator/health</p>
              <Badge className="mt-2" variant={proofs.health ? "success" : "warning"}>
                {proofs.health ? "pass" : "running"}
              </Badge>
            </div>
            <div className="rounded-xl border border-slate-800 p-4 dark:border-white/10">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Smoke test proof</p>
              <p className="mt-1 text-xs text-slate-500">Core payment and auth smoke suite</p>
              <Badge className="mt-2" variant={proofs.smoke ? "success" : "warning"}>
                {proofs.smoke ? "pass" : "running"}
              </Badge>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
            <p className="text-sm text-slate-900 dark:text-white">
              Verified deploy is green only when both proofs pass.
            </p>
            <Progress value={proofsReady ? 100 : 50} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 z-20 rounded-2xl border border-slate-800 bg-[#0f1d32] p-4 shadow-2xl dark:border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Promotion gate</p>
            <p className="text-xs text-slate-400">
              Promote is enabled only when health and smoke are both green.
            </p>
          </div>
          <input
            value={gateNote}
            onChange={(e) => onGateNoteChange(e.target.value)}
            placeholder="Request changes note"
            className="h-9 w-full rounded-lg border border-white/10 bg-[#081321] px-3 text-sm text-slate-200 outline-none sm:w-72"
          />
          <Button variant="outline" size="sm" onClick={onRequestChanges}>
            Request changes
          </Button>
          <Button variant="c4" size="sm" onClick={onPromote} disabled={!proofsReady}>
            Promote to production
          </Button>
        </div>
      </div>
    </>
  );
}
