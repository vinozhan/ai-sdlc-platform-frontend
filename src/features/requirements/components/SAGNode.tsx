import { Handle, Position, type NodeProps } from "reactflow";
import { User, Database, Box, AlertCircle } from "lucide-react";

export const sagNodeColors: Record<string, string> = {
  actor: "#22c55e",
  entity: "#3b82f6",
  module: "#2563eb",
  constraint: "#f97316",
};

const nodeColors = sagNodeColors;

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

export const sagNodeTypes = { sag: SAGNodeComponent };
