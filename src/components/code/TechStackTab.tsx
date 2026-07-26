import { useState } from "react";
import { ChevronDown, Cpu, Database, Layers, Server, Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";
import { useStore } from "@/store/useStore";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Progress } from "@/components/ui/primitives";
import { techStackRecommendations, type TechStackRecommendation } from "@/data/mockData";

const layerIcons: Record<string, typeof Layers> = {
  Frontend: Layers,
  Backend: Server,
  Database: Database,
  "Infra / DevOps": Cpu,
};

function confidenceBadge(score: number) {
  if (score >= 90) return { label: "Excellent fit", variant: "success" as const };
  if (score >= 80) return { label: "Good fit", variant: "info" as const };
  return { label: "Moderate fit", variant: "warning" as const };
}

function RecommendationCard({
  item,
  selection,
  onOverride,
}: {
  item: TechStackRecommendation;
  selection: string;
  onOverride: (id: string, value: string) => void;
}) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  const Icon = layerIcons[item.layer] ?? Sparkles;
  const fit = confidenceBadge(item.confidence);
  const options = [item.recommended, ...item.alternatives.map((a) => a.name)];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-4 w-4 text-blue-400" />
            {item.layer}
          </CardTitle>
          <Badge variant={fit.variant}>{fit.label} · {item.confidence}%</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>{selection}</span>
          <span className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>{item.version}</span>
        </div>

        <p className={cn("text-sm leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>{item.rationale}</p>

        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className={isDark ? "text-slate-500" : "text-slate-400"}>Confidence</span>
            <span className={isDark ? "text-slate-300" : "text-slate-700"}>{item.confidence}%</span>
          </div>
          <Progress value={item.confidence} color="#2563eb" className="h-1.5" />
        </div>

        <div>
          <p className={cn("mb-2 text-xs font-semibold uppercase tracking-wide", isDark ? "text-slate-500" : "text-slate-400")}>
            Alternatives considered
          </p>
          <div className="space-y-2">
            {item.alternatives.map((alt) => (
              <div
                key={alt.name}
                className={cn("rounded-lg border p-2.5", isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50")}
              >
                <p className={cn("text-xs font-medium", isDark ? "text-slate-300" : "text-slate-700")}>{alt.name}</p>
                <p className={cn("mt-0.5 text-xs", isDark ? "text-slate-500" : "text-slate-500")}>{alt.reason}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={selection}
              onChange={(e) => onOverride(item.id, e.target.value)}
              className={cn(
                "w-full appearance-none rounded-lg border py-2 pl-3 pr-8 text-sm",
                isDark ? "border-white/10 bg-white/[0.04] text-slate-200" : "border-slate-200 bg-white text-slate-800"
              )}
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className={cn("pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2", isDark ? "text-slate-500" : "text-slate-400")} />
          </div>
          <Button size="sm" variant="outline" onClick={() => onOverride(item.id, item.recommended)}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function TechStackTab() {
  const { theme, addToast } = useStore();
  const isDark = theme === "dark";
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(techStackRecommendations.map((r) => [r.id, r.recommended]))
  );

  const handleOverride = (id: string, value: string) => {
    setSelections((prev) => ({ ...prev, [id]: value }));
    addToast({ type: "info", title: "Stack updated", message: `Changed to ${value}` });
  };

  return (
    <div className="space-y-4">
      <div className={cn("rounded-xl border p-4", isDark ? "border-blue-500/30 bg-blue-500/5" : "border-blue-200 bg-blue-50/50")}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <p className={cn("text-sm font-medium", isDark ? "text-blue-200" : "text-blue-800")}>
            AI-generated stack recommendation
          </p>
        </div>
        <p className={cn("mt-1 text-xs", isDark ? "text-slate-400" : "text-slate-600")}>
          Based on your requirements, payment compliance needs, and team profile. Override any layer if you prefer a different technology.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {techStackRecommendations.map((item) => (
          <RecommendationCard
            key={item.id}
            item={item}
            selection={selections[item.id] ?? item.recommended}
            onOverride={handleOverride}
          />
        ))}
      </div>
    </div>
  );
}
