import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/shared/ui/primitives";

export function StatusChip({ connected }: { connected: boolean }) {
  return (
    <Badge variant={connected ? "success" : "error"}>
      {connected ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {connected ? "Connected" : "Disconnected"}
    </Badge>
  );
}
