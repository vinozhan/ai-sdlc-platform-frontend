import { Clock3, TriangleAlert } from "lucide-react";
import { Button, Card, CardContent } from "@/shared/ui/primitives";
import type { StageId } from "../model/types";

export function StageAlerts({
  activeStage,
  waitingForTesting,
  proofsReady,
  pendingRollback,
  onOpenVerify,
  onConfirmRollback,
  onCancelRollback,
}: {
  activeStage: StageId;
  waitingForTesting: boolean;
  proofsReady: boolean;
  pendingRollback: string | null;
  onOpenVerify: () => void;
  onConfirmRollback: () => void;
  onCancelRollback: () => void;
}) {
  return (
    <>
      {activeStage !== "verify" && !waitingForTesting && !proofsReady && (
        <Card>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2 text-sm">
              <TriangleAlert className="h-4 w-4 text-amber-400" />
              <span className="text-slate-300">Verify stage is waiting on both proofs.</span>
            </div>
            <Button size="sm" variant="outline" onClick={onOpenVerify}>
              Open verify stage
            </Button>
          </CardContent>
        </Card>
      )}

      {pendingRollback && (
        <Card className="border-red-500/30">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
              <Clock3 className="h-4 w-4 text-red-400" />
              <span className="text-slate-900 dark:text-white">
                Confirm roll back to verified release {pendingRollback}.
              </span>
            </div>
            <Button size="sm" variant="error" onClick={onConfirmRollback}>
              Confirm roll back
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelRollback}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {waitingForTesting && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-900 dark:text-white">Not started: waiting for the Testing gate.</p>
            <p className="mt-1 text-xs text-slate-500">
              This project can start deployment only after Testing and Security are approved.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
