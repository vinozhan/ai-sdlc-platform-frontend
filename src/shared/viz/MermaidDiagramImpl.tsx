import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { cn } from "@/shared/utils/cn";
import { fonts } from "@/shared/constants/fonts";

let mermaidTheme: "dark" | "default" = "dark";

function initMermaid(isDark: boolean) {
  const theme = isDark ? "dark" : "default";
  if (mermaidTheme === theme) return;
  mermaidTheme = theme;
  mermaid.initialize({
    startOnLoad: false,
    theme,
    themeVariables: isDark
      ? {
          darkMode: true,
          background: "#0f172a",
          primaryColor: "#1e293b",
          primaryTextColor: "#e2e8f0",
          primaryBorderColor: "#334155",
          lineColor: "#64748b",
          secondaryColor: "#1e293b",
          tertiaryColor: "#0f172a",
          fontFamily: fonts.sans.stack,
        }
      : {
          background: "#ffffff",
          primaryColor: "#f8fafc",
          primaryTextColor: "#0f172a",
          primaryBorderColor: "#cbd5e1",
          lineColor: "#64748b",
          secondaryColor: "#f1f5f9",
          tertiaryColor: "#ffffff",
          fontFamily: fonts.sans.stack,
        },
    flowchart: { curve: "basis", padding: 16, htmlLabels: true },
    sequence: { actorMargin: 40, messageMargin: 35 },
    securityLevel: "loose",
  });
}

export function MermaidDiagramImpl({
  chart,
  id,
  isDark = true,
  className,
  minHeight = 280,
}: {
  chart: string;
  id: string;
  isDark?: boolean;
  className?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initMermaid(isDark);
  }, [isDark]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    const render = async () => {
      try {
        initMermaid(isDark);
        const renderId = `mermaid-${id}-${Date.now()}`;
        const { svg } = await mermaid.render(renderId, chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          const svgEl = ref.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.maxWidth = "100%";
            svgEl.style.height = "auto";
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, id, isDark]);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border p-4",
          isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50",
          className
        )}
        style={{ minHeight }}
      >
        <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
          Unable to render diagram preview
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-auto rounded-xl border",
        isDark ? "border-white/10 bg-slate-950/50" : "border-slate-200 bg-slate-50/80",
        className
      )}
      style={{ minHeight }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn("h-5 w-5 animate-spin rounded-full border-2 border-t-transparent", isDark ? "border-slate-500" : "border-slate-300")} />
        </div>
      )}
      <div
        ref={ref}
        className={cn("flex items-center justify-center p-4", loading && "opacity-0")}
      />
    </div>
  );
}
