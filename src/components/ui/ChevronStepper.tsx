import { cn } from "@/utils/cn";

type StepStatus = "complete" | "pending" | "future";

function chevronClip(isFirst: boolean, isLast: boolean) {
  const tip = 10;
  if (isFirst && isLast) return undefined;
  if (isFirst) return `polygon(0 0, calc(100% - ${tip}px) 0, 100% 50%, calc(100% - ${tip}px) 100%, 0 100%)`;
  if (isLast) return `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${tip}px 50%)`;
  return `polygon(0 0, calc(100% - ${tip}px) 0, 100% 50%, calc(100% - ${tip}px) 100%, 0 100%, ${tip}px 50%)`;
}

const statusStyles: Record<StepStatus, string> = {
  complete: "bg-emerald-500 text-white",
  pending: "bg-amber-400 text-white",
  future: "bg-slate-200 text-slate-500",
};

export function ChevronStepper({
  steps,
  currentId,
  progressId,
  selectedId,
  isDark = false,
  onStepClick,
}: {
  steps: { id: string; label: string }[];
  currentId?: string;
  progressId?: string;
  selectedId?: string | null;
  isDark?: boolean;
  onStepClick?: (id: string) => void;
}) {
  const progress = progressId ?? currentId ?? steps[0]?.id ?? "";
  const currentIdx = steps.findIndex((s) => s.id === progress);
  const allComplete = progress === "done";

  const getStatus = (index: number): StepStatus => {
    if (allComplete) return "complete";
    if (currentIdx === -1) return "future";
    if (index < currentIdx) return "complete";
    if (index === currentIdx) return "pending";
    return "future";
  };

  return (
    <div
      className={cn(
        "scroll-touch scrollbar-thin scroll-snap-x flex gap-1 overflow-x-auto rounded-xl border p-1.5 sm:p-2",
        isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200/80 bg-white shadow-sm"
      )}
    >
      {steps.map((step, i) => {
        const isFirst = i === 0;
        const isLast = i === steps.length - 1;
        const status = getStatus(i);

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepClick?.(step.id)}
            disabled={!onStepClick || status === "future"}
            className={cn(
              "scroll-snap-start flex min-w-[96px] flex-1 items-center justify-center whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold tracking-wide transition-opacity sm:min-w-[88px] sm:px-4 sm:text-xs",
              statusStyles[status],
              isDark && status === "future" && "bg-slate-700/60 text-slate-400",
              isDark && status === "complete" && "bg-emerald-600 text-white",
              isDark && status === "pending" && "bg-amber-500 text-white",
              onStepClick && status !== "future" && "cursor-pointer active:opacity-80 sm:hover:opacity-90",
              !onStepClick && "cursor-default",
              selectedId === step.id && "ring-2 ring-blue-500 ring-offset-1",
              isDark && selectedId === step.id && "ring-offset-[#071018]"
            )}
            style={{
              clipPath: chevronClip(isFirst, isLast),
              zIndex: steps.length - i,
            }}
          >
            {step.label}
          </button>
        );
      })}
    </div>
  );
}
