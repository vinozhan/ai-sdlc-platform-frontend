import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    darkMode: true,
    background: "#0f172a",
    primaryColor: "#1e293b",
    primaryTextColor: "#e2e8f0",
    primaryBorderColor: "#334155",
    lineColor: "#475569",
    secondaryColor: "#1e293b",
    tertiaryColor: "#0f172a",
    fontFamily: "Inter, sans-serif",
  },
  flowchart: { curve: "basis", padding: 20 },
  securityLevel: "loose",
});

export function MermaidDiagram({ chart, id }: { chart: string; id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        const { svg } = await mermaid.render(`mermaid-${id}-${Date.now()}`, chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch {
        if (!cancelled) setError(true);
      }
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-slate-950 p-4">
        <pre className="overflow-auto font-mono text-[10px] text-slate-500">{chart}</pre>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="flex min-h-[300px] items-center justify-center overflow-auto rounded-lg bg-slate-950 p-4"
    />
  );
}
