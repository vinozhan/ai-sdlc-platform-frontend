import { useState } from "react";
import { FileCode2, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/shared/ui/primitives";
import { cn } from "@/shared/utils/cn";
import { backlog } from "../fixtures/codeData";

export function SprintScope() {
  const [selected, setSelected] = useState<string[]>(["US-101", "US-102", "US-103"]);
  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-blue-400" />
            Sprint Backlog & Scope
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {backlog.map((item) => (
            <label
              key={item.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                selected.includes(item.id) ? "border-blue-500/40 bg-blue-500/5" : "border-slate-800 hover:border-slate-700"
              )}
            >
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => toggle(item.id)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-blue-500"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-200">{item.title}</p>
                <p className="text-xs text-slate-500">{item.id} · {item.epic}</p>
              </div>
              <Badge variant="c2">{item.storyPoints} pts</Badge>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            Wireframe & SAG Input
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-400">Wireframe Screens</p>
              <div className="space-y-2">
                {["Payment Form", "KYC Verification", "Transaction History"].map((s) => (
                  <div key={s} className="flex items-center gap-2 rounded bg-slate-900 p-2">
                    <div className="h-8 w-8 rounded bg-blue-500/10" />
                    <span className="text-xs text-slate-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-400">SAG Subgraph</p>
              <div className="space-y-2">
                {["Payment Service", "KYC Service", "API Gateway", "User Entity"].map((s) => (
                  <div key={s} className="flex items-center gap-2 rounded bg-slate-900 p-2">
                    <div className="h-2 w-2 rounded-full bg-blue-400" />
                    <span className="text-xs text-slate-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
            <p className="text-xs font-semibold text-blue-300">Generation Scope</p>
            <p className="mt-1 text-xs text-slate-300">
              {selected.length} stories selected · Estimated 42 files to generate · 3 API contracts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
