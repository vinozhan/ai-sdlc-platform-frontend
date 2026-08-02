import { type ReactNode } from "react";
import { useIsDark } from "@/shared/theme";
import { cn } from "@/shared/utils/cn";
import { surface } from "./surface";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  const isDark = useIsDark();

  return (
    <div className={className}>
      <label className={cn("mb-1.5 block text-sm font-medium", isDark ? "text-slate-200" : "text-slate-700")}>
        {label}
      </label>
      {children}
      {hint && <p className={cn("mt-1.5 text-xs", surface.faint(isDark))}>{hint}</p>}
    </div>
  );
}

export function useFieldClasses() {
  const isDark = useIsDark();
  return {
    isDark,
    fieldClass: surface.field(isDark),
    textAreaClass: surface.textArea(isDark),
  };
}
