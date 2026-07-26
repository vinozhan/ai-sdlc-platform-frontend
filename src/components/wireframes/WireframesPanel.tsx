import { useState } from "react";
import { LayoutGrid, Monitor } from "lucide-react";
import { cn } from "@/utils/cn";
import { Badge, Card, CardContent } from "@/components/ui/primitives";
import { defaultWireframeCards, getFlowForWireframe } from "@/data/wireframeFlows";
import { WireframeMockupModal } from "@/components/wireframes/WireframeMockupModal";

export function WireframesPanel({
  isDark,
  onApprove,
  onRequestRefinement,
}: {
  isDark: boolean;
  onApprove: () => void;
  onRequestRefinement: (feedback: string, wireframeName: string) => void;
}) {
  const [activeFlow, setActiveFlow] = useState<string | null>(null);
  const [versions, setVersions] = useState<Record<string, string>>(() =>
    Object.fromEntries(defaultWireframeCards.map((name) => [name, getFlowForWireframe(name).defaultVersion]))
  );
  const [approved, setApproved] = useState<Record<string, boolean>>({});

  const openFlow = activeFlow ? getFlowForWireframe(activeFlow) : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {defaultWireframeCards.map((screen) => (
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
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>{screen}</p>
                  <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>Auto-generated wireframe</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-50 text-blue-700")}>
                    {versions[screen]}
                  </span>
                  {approved[screen] && <Badge variant="success">Approved</Badge>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveFlow(screen)}
                className={cn(
                  "mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
                  isDark
                    ? "border-blue-500/40 text-blue-300 hover:bg-blue-500/10"
                    : "border-blue-200 text-blue-700 hover:bg-blue-50"
                )}
              >
                <Monitor className="h-3.5 w-3.5" />
                Mockup
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {openFlow && activeFlow && (
        <WireframeMockupModal
          flow={openFlow}
          version={versions[activeFlow] ?? openFlow.defaultVersion}
          isOpen={!!activeFlow}
          isDark={isDark}
          onClose={() => setActiveFlow(null)}
          onApprove={() => {
            setApproved((prev) => ({ ...prev, [activeFlow]: true }));
            setActiveFlow(null);
            onApprove();
          }}
          onRequestRefinement={(feedback) => {
            const sprintNum = (versions[activeFlow]?.match(/\d+/)?.[0] ?? "1");
            const next = `updated sprint ${Number(sprintNum) + 1}`;
            setVersions((prev) => ({ ...prev, [activeFlow]: next }));
            setApproved((prev) => ({ ...prev, [activeFlow]: false }));
            setActiveFlow(null);
            onRequestRefinement(feedback, activeFlow);
          }}
        />
      )}
    </>
  );
}
