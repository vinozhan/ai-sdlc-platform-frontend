import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives";
import { cn } from "@/shared/utils/cn";
import { extractedEntities } from "../fixtures/designData";

export function EntitiesPanel({ isDark }: { isDark: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[
        { title: "Actors", items: extractedEntities.actors, color: "#22c55e" },
        { title: "Entities", items: extractedEntities.entities, color: "#3b82f6" },
        { title: "Actions", items: extractedEntities.actions, color: "#2563eb" },
        { title: "Relationships", items: extractedEntities.relationships, color: "#f97316" },
      ].map((col) => (
        <Card key={col.title}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
              {col.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {col.items.map((item) => (
              <div
                key={item}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs",
                  isDark ? "border-white/5 text-slate-300" : "border-slate-100 text-slate-600"
                )}
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
