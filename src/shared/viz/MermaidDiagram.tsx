import { lazy, Suspense, type ComponentProps } from "react";
import { cn } from "@/shared/utils/cn";

const MermaidDiagramImpl = lazy(() =>
  import("./MermaidDiagramImpl").then((m) => ({ default: m.MermaidDiagramImpl })),
);

type MermaidProps = ComponentProps<typeof MermaidDiagramImpl>;

function MermaidFallback({
  isDark = true,
  className,
  minHeight = 280,
}: Pick<MermaidProps, "isDark" | "className" | "minHeight">) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border",
        isDark ? "border-white/10 bg-slate-950/50" : "border-slate-200 bg-slate-50/80",
        className,
      )}
      style={{ minHeight }}
    >
      <div
        className={cn(
          "h-5 w-5 animate-spin rounded-full border-2 border-t-transparent",
          isDark ? "border-slate-500" : "border-slate-300",
        )}
      />
    </div>
  );
}

/** Lazy-loaded Mermaid wrapper — keeps mermaid out of the initial bundle. */
export function MermaidDiagram(props: MermaidProps) {
  return (
    <Suspense
      fallback={
        <MermaidFallback
          isDark={props.isDark}
          className={props.className}
          minHeight={props.minHeight}
        />
      }
    >
      <MermaidDiagramImpl {...props} />
    </Suspense>
  );
}
