import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives";
import { cn } from "@/shared/utils/cn";
import { sagNodes, sagEdges } from "../fixtures/designData";
import { sagNodeTypes, sagNodeColors } from "./SAGNode";

export function SagCanvas({ isDark }: { isDark: boolean }) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-4 w-4 text-green-500" />
          Semantic Architecture Graph
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className={cn("h-[52vh] min-h-[320px] w-full md:h-[480px]", isDark ? "bg-[#0a0e17]" : "bg-slate-50")}>
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={sagNodeTypes} fitView fitViewOptions={{ padding: 0.2 }}>
            <Background color={isDark ? "#1e293b" : "#cbd5e1"} gap={20} />
            <Controls />
            <MiniMap
              nodeColor={(n) => sagNodeColors[n.data?.type as string] ?? "#64748b"}
              maskColor={isDark ? "rgba(15,23,42,0.7)" : "rgba(248,250,252,0.7)"}
            />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
}
