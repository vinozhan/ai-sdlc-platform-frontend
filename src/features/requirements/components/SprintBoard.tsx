import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives";
import { cn } from "@/shared/utils/cn";
import { backlog, sprintData } from "../fixtures/designData";

export function SprintBoard({ isDark }: { isDark: boolean }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Sprint", value: sprintData.name },
          { label: "Points", value: String(sprintData.totalPoints) },
          { label: "Completed", value: String(sprintData.completedPoints) },
          { label: "Goal", value: sprintData.goal.slice(0, 28) + "…" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>{s.label}</p>
              <p className={cn("mt-1 text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Backlog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {backlog.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3",
                isDark ? "border-white/5" : "border-slate-100"
              )}
            >
              <span className={cn("font-mono text-[10px]", isDark ? "text-slate-500" : "text-slate-400")}>
                {item.id}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm", isDark ? "text-slate-200" : "text-slate-800")}>{item.title}</p>
                <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>{item.epic}</p>
              </div>
              <Badge variant="c1">{item.storyPoints} pts</Badge>
              <Badge variant={item.status === "done" ? "success" : item.status === "in-progress" ? "info" : "default"}>
                {item.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
