import { useMemo, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Pencil,
  Code2,
  FlaskConical,
  ShieldAlert,
  Rocket,
  CheckCheck,
  Download,
  Clock,
} from "lucide-react";
import { Card, CardContent, Button, Badge } from "@/components/ui/primitives";
import { activityLogEntries, type ActivityLogCategory, type ActivityLogEntry } from "@/data/mockData";
import { useStore } from "@/store/useStore";
import { cn } from "@/utils/cn";
import { PhaseSectionHeader } from "@/components/project/PhaseSectionHeader";

const categoryConfig: Record<
  ActivityLogCategory,
  { icon: typeof CheckCircle2; iconBg: string; label: string }
> = {
  requirement: { icon: FileText, iconBg: "bg-blue-600", label: "Requirements" },
  design: { icon: Pencil, iconBg: "bg-blue-600", label: "Design" },
  code: { icon: Code2, iconBg: "bg-blue-600", label: "Code" },
  test: { icon: FlaskConical, iconBg: "bg-amber-500", label: "Testing" },
  security: { icon: ShieldAlert, iconBg: "bg-amber-500", label: "Security" },
  deploy: { icon: Rocket, iconBg: "bg-emerald-500", label: "Deployment" },
  approval: { icon: CheckCheck, iconBg: "bg-emerald-500", label: "Approval" },
};

const metricToneStyles = {
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
  neutral: "text-slate-900 dark:text-slate-100",
};

function TimelineEntry({ entry, isDark, isLast }: { entry: ActivityLogEntry; isDark: boolean; isLast: boolean }) {
  const config = categoryConfig[entry.category];
  const Icon = config.icon;
  const isSuccess =
    entry.metricTone === "success" ||
    entry.category === "deploy" ||
    (entry.category === "approval" && entry.metricTone !== "warning");
  const iconBg = isSuccess ? "bg-emerald-500" : config.iconBg;
  const DisplayIcon = isSuccess ? CheckCircle2 : Icon;

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {!isLast && (
        <div
          className={cn(
            "absolute left-4 top-8 w-px -translate-x-1/2",
            isDark ? "bg-slate-700" : "bg-slate-200"
          )}
          style={{ height: "calc(100% - 8px)" }}
        />
      )}

      <div className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", iconBg)}>
        <DisplayIcon className="h-4 w-4 text-white" />
      </div>

      <div className="flex min-w-0 flex-1 items-start justify-between gap-4 pt-0.5">
        <div className="min-w-0 space-y-1">
          <h4 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>
            {entry.title}
          </h4>
          <p className={cn("text-sm leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>
            {entry.description}
          </p>
          {entry.metric && (
            <p className={cn("text-sm font-semibold", metricToneStyles[entry.metricTone ?? "neutral"])}>
              {entry.metric}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="default">{config.label}</Badge>
            <span className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
              {entry.actor}
            </span>
            {entry.artifactRef && (
              <span className={cn("font-mono text-[10px]", isDark ? "text-slate-600" : "text-slate-400")}>
                {entry.artifactRef}
              </span>
            )}
          </div>
        </div>
        <time
          dateTime={entry.timestamp}
          className={cn("shrink-0 text-sm", isDark ? "text-slate-500" : "text-slate-400")}
        >
          {entry.displayDate}
        </time>
      </div>
    </div>
  );
}

export function ActivityLog() {
  const { theme, addToast } = useStore();
  const isDark = theme === "dark";
  const [filter, setFilter] = useState<ActivityLogCategory | "all">("all");

  const sortedEntries = useMemo(
    () =>
      [...activityLogEntries].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    []
  );

  const filteredEntries = useMemo(
    () => (filter === "all" ? sortedEntries : sortedEntries.filter((e) => e.category === filter)),
    [sortedEntries, filter]
  );

  const handleExport = () => {
    const payload = filteredEntries.map(({ id, timestamp, title, description, actor, category, metric, artifactRef }) => ({
      id,
      timestamp,
      title,
      description,
      actor,
      category,
      metric,
      artifactRef,
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "activity-log.json";
    link.click();
    URL.revokeObjectURL(url);
    addToast({ type: "success", title: "Export complete", message: `${filteredEntries.length} entries exported` });
  };

  const categories: { id: ActivityLogCategory | "all"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "requirement", label: "Requirements" },
    { id: "design", label: "Design" },
    { id: "code", label: "Code" },
    { id: "test", label: "Testing" },
    { id: "security", label: "Security" },
    { id: "deploy", label: "Deployment" },
    { id: "approval", label: "Approvals" },
  ];

  return (
    <div className="w-full space-y-5 p-6 md:p-8">
      <PhaseSectionHeader
        title="Activity Log"
        subtitle="Complete project timeline from requirements through deployment"
        progress={0}
        isDark={isDark}
        showProgress={false}
        action={
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  filter === cat.id
                    ? isDark
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                    : isDark
                      ? "border-white/10 text-slate-400 hover:bg-white/[0.04]"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {filteredEntries.length === 0 ? (
            <div className={cn("py-12 text-center text-sm", isDark ? "text-slate-500" : "text-slate-400")}>
              No activity entries for this filter.
            </div>
          ) : (
            <div className="relative">
              {filteredEntries.map((entry, i) => (
                <TimelineEntry
                  key={entry.id}
                  entry={entry}
                  isDark={isDark}
                  isLast={i === filteredEntries.length - 1}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div
        className={cn(
          "flex flex-wrap items-center gap-4 rounded-xl border px-4 py-3 text-xs",
          isDark ? "border-white/10 bg-white/[0.02] text-slate-500" : "border-slate-200 bg-slate-50 text-slate-500"
        )}
      >
        <span className="flex items-center gap-1.5 font-medium">
          <Clock className="h-3.5 w-3.5" />
          {sortedEntries.length} total events
        </span>
        <span className={isDark ? "text-slate-600" : "text-slate-300"}>|</span>
        <span>Data sourced from pipeline runs, audit log, and artifact traceability</span>
      </div>
    </div>
  );
}

/** @deprecated Use ActivityLog */
export const Traceability = ActivityLog;
