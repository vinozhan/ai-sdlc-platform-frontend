import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import { useUiStore } from "@/store/ui";
import { cn } from "@/shared/utils/cn";

export function Toasts() {
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);
  const theme = useUiStore((s) => s.theme);
  const isDark = theme === "dark";

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[90] flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-96">
      {toasts.map((toast) => {
        const Icon =
          toast.type === "success"
            ? CheckCircle2
            : toast.type === "error"
            ? XCircle
            : toast.type === "warning"
            ? AlertTriangle
            : Info;
        const color =
          toast.type === "success"
            ? "text-emerald-500"
            : toast.type === "error"
            ? "text-red-500"
            : toast.type === "warning"
            ? "text-amber-500"
            : "text-blue-500";
        return (
          <div
            key={toast.id}
            className={cn(
              "flex w-full items-start gap-3 rounded-2xl border p-3 shadow-2xl sm:w-80",
              isDark ? "border-white/10 bg-[#0f1d32]" : "border-slate-200 bg-white"
            )}
          >
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", color)} />
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-800")}>{toast.title}</p>
              {toast.message && (
                <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{toast.message}</p>
              )}
            </div>
            <button onClick={() => removeToast(toast.id)}>
              <X className={cn("h-3.5 w-3.5", isDark ? "text-slate-500" : "text-slate-400")} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
