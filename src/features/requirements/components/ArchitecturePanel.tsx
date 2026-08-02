import { Badge, Card, CardContent } from "@/shared/ui/primitives";
import { cn } from "@/shared/utils/cn";
import { architecturePatterns } from "../fixtures/designData";

export function ArchitecturePanel({ isDark }: { isDark: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {architecturePatterns.slice(0, 3).map((p) => (
        <Card key={p.id} className={p.id === "microservices" ? "ring-2 ring-blue-500/40" : undefined}>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h4 className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>{p.name}</h4>
              <Badge variant="c3">{p.confidence}%</Badge>
            </div>
            <p className={cn("text-xs leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>
              {p.explanation}
            </p>
            <div className="flex flex-wrap gap-1">
              {p.pros.slice(0, 2).map((pro) => (
                <Badge key={pro} variant="success">
                  {pro}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
