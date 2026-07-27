import { useEffect, useState } from "react";
import { X, Maximize2, Code2, LayoutGrid } from "lucide-react";
import { cn } from "@/utils/cn";
import { Card, CardContent, CardHeader, CardTitle, CodeBlock } from "@/components/ui/primitives";
import { MermaidDiagram } from "@/components/ui/MermaidDiagram";
import { umlDiagramList, type UMLDiagramDefinition } from "@/data/umlDiagrams";

type ViewMode = "diagram" | "code";

function ViewToggle({
  mode,
  onChange,
  isDark,
  size = "sm",
  iconOnly = false,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  isDark: boolean;
  size?: "sm" | "md";
  iconOnly?: boolean;
}) {
  const tabs: { id: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
    { id: "diagram", label: "Tab View", icon: LayoutGrid },
    { id: "code", label: "Code View", icon: Code2 },
  ];

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border p-0.5",
        isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-slate-100/80",
        size === "md" && "p-1"
      )}
    >
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          title={label}
          aria-label={label}
          onClick={(e) => {
            e.stopPropagation();
            onChange(id);
          }}
          className={cn(
            "flex items-center rounded-md font-medium transition-colors",
            iconOnly
              ? "p-1.5"
              : cn("gap-1.5", size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"),
            mode === id
              ? isDark
                ? "bg-white/10 text-white shadow-sm"
                : "bg-white text-slate-900 shadow-sm"
              : isDark
                ? "text-slate-400 hover:text-slate-200"
                : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Icon className={iconOnly ? "h-3.5 w-3.5" : size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
          {!iconOnly && label}
        </button>
      ))}
    </div>
  );
}

function DiagramContent({
  diagram,
  mode,
  isDark,
  minHeight,
  codeMaxHeight,
}: {
  diagram: UMLDiagramDefinition;
  mode: ViewMode;
  isDark: boolean;
  minHeight?: number;
  codeMaxHeight?: string;
}) {
  if (mode === "code") {
    return (
      <CodeBlock
        code={diagram.code}
        language="mermaid"
        className={cn(codeMaxHeight ?? "max-h-64")}
      />
    );
  }

  return (
    <MermaidDiagram
      chart={diagram.code}
      id={diagram.id}
      isDark={isDark}
      minHeight={minHeight ?? 280}
    />
  );
}

export function UMLDiagramCard({
  diagram,
  isDark,
  onExpand,
}: {
  diagram: UMLDiagramDefinition;
  isDark: boolean;
  onExpand: (diagram: UMLDiagramDefinition) => void;
}) {
  const [mode, setMode] = useState<ViewMode>("diagram");

  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        isDark ? "hover:border-white/20" : "hover:border-slate-300"
      )}
      onDoubleClick={() => onExpand(diagram)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">{diagram.title}</CardTitle>
            <p className={cn("mt-1 text-xs leading-relaxed", isDark ? "text-slate-500" : "text-slate-400")}>
              {diagram.description}
            </p>
          </div>
          <ViewToggle mode={mode} onChange={setMode} isDark={isDark} iconOnly />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <DiagramContent diagram={diagram} mode={mode} isDark={isDark} />
        <p className={cn("mt-2 flex items-center gap-1 text-[10px]", isDark ? "text-slate-600" : "text-slate-400")}>
          <Maximize2 className="h-3 w-3" />
          Double-click to expand
        </p>
      </CardContent>
    </Card>
  );
}

export function UMLDiagramModal({
  diagram,
  isOpen,
  isDark,
  onClose,
}: {
  diagram: UMLDiagramDefinition | null;
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<ViewMode>("diagram");

  useEffect(() => {
    if (isOpen) setMode("diagram");
  }, [isOpen, diagram?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !diagram) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close diagram"
      />

      <div
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl shadow-2xl",
          isDark ? "border border-white/10 bg-[#0f172a]" : "border border-slate-200 bg-white"
        )}
      >
        <div className={cn("flex items-start justify-between gap-4 border-b px-6 py-4", isDark ? "border-white/10" : "border-slate-100")}>
          <div>
            <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
              {diagram.title}
            </h2>
            <p className={cn("mt-1 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
              {diagram.description}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <ViewToggle mode={mode} onChange={setMode} isDark={isDark} size="md" />
            <button
              type="button"
              onClick={onClose}
              className={cn("rounded-lg p-1.5 transition-colors", isDark ? "hover:bg-white/10" : "hover:bg-slate-100")}
            >
              <X className={cn("h-5 w-5", isDark ? "text-slate-400" : "text-slate-500")} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <DiagramContent
            diagram={diagram}
            mode={mode}
            isDark={isDark}
            minHeight={480}
            codeMaxHeight="max-h-[60vh]"
          />
        </div>
      </div>
    </div>
  );
}

export function UMLPanel({ isDark }: { isDark: boolean }) {
  const [expanded, setExpanded] = useState<UMLDiagramDefinition | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {umlDiagramList.map((diagram) => (
          <UMLDiagramCard
            key={diagram.id}
            diagram={diagram}
            isDark={isDark}
            onExpand={setExpanded}
          />
        ))}
      </div>

      <UMLDiagramModal
        diagram={expanded}
        isOpen={!!expanded}
        isDark={isDark}
        onClose={() => setExpanded(null)}
      />
    </>
  );
}
