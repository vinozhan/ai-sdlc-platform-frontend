import { useMemo } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { useStore } from "@/store/useStore";
import { breadcrumbParts } from "@/components/code/buildFileTree";
import { highlightCode, languageFromPath } from "@/components/code/syntaxHighlight";
import { getFileIcon } from "@/components/code/fileIcons";

export type EditorTab = {
  path: string;
  unsaved?: boolean;
};

export function VSCodeEditor({
  tabs,
  activePath,
  contents,
  onSelectTab,
  onCloseTab,
  onDirty,
}: {
  tabs: EditorTab[];
  activePath: string;
  contents: Record<string, string>;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
  onDirty?: (path: string) => void;
}) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  const code = contents[activePath] ?? "";
  const language = languageFromPath(activePath);
  const highlighted = useMemo(() => highlightCode(code, language, isDark), [code, language, isDark]);
  const crumbs = breadcrumbParts(activePath);
  const { icon: Icon, color } = getFileIcon(activePath);

  return (
    <div className={cn("flex h-full flex-col overflow-hidden rounded-xl border", isDark ? "border-white/10 bg-[#1e1e1e]" : "border-slate-200 bg-white")}>
      {/* Tab bar */}
      <div className={cn("flex overflow-x-auto border-b", isDark ? "border-white/10 bg-[#252526]" : "border-slate-200 bg-[#f3f3f3]")}>
        {tabs.map((tab) => {
          const active = tab.path === activePath;
          const TabIcon = getFileIcon(tab.path).icon;
          const tabColor = getFileIcon(tab.path).color;
          return (
            <div
              key={tab.path}
              className={cn(
                "group flex max-w-[200px] shrink-0 items-center gap-1.5 border-r px-3 py-2 text-[12px]",
                isDark ? "border-white/10" : "border-slate-200",
                active
                  ? isDark
                    ? "bg-[#1e1e1e] text-slate-200"
                    : "bg-white text-slate-800"
                  : isDark
                  ? "bg-[#2d2d2d] text-slate-500 hover:bg-[#1e1e1e]"
                  : "bg-[#ececec] text-slate-500 hover:bg-white"
              )}
            >
              <button type="button" onClick={() => onSelectTab(tab.path)} className="flex min-w-0 flex-1 items-center gap-1.5">
                <TabIcon className="h-3.5 w-3.5 shrink-0" style={{ color: tabColor }} />
                <span className="truncate">{tab.path.split("/").pop()}</span>
                {tab.unsaved && <span className="h-2 w-2 shrink-0 rounded-full bg-white" />}
              </button>
              <button
                type="button"
                onClick={() => onCloseTab(tab.path)}
                className={cn("rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100", isDark ? "hover:bg-white/10" : "hover:bg-slate-200")}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Breadcrumb */}
      <div className={cn("flex items-center gap-1 border-b px-3 py-1.5 text-[11px]", isDark ? "border-white/10 bg-[#1e1e1e] text-slate-500" : "border-slate-100 bg-slate-50 text-slate-500")}>
        <Icon className="h-3 w-3 shrink-0" style={{ color }} />
        {crumbs.map((part, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-slate-600">›</span>}
            <span className={cn(i === crumbs.length - 1 && (isDark ? "text-slate-300" : "text-slate-700"))}>{part}</span>
          </span>
        ))}
      </div>

      {/* Editor body */}
      <div className="relative min-h-0 flex-1 overflow-auto font-mono text-[13px] leading-[1.6]">
        <div className="flex min-w-max">
          <div className={cn("sticky left-0 select-none border-r py-3 pr-3 text-right", isDark ? "border-white/10 bg-[#1e1e1e] text-slate-600" : "border-slate-200 bg-slate-50 text-slate-400")}>
            {highlighted.map((_, i) => (
              <div key={i} className="px-2">{i + 1}</div>
            ))}
          </div>
          <pre
            className={cn("min-w-0 flex-1 py-3 pl-4", isDark ? "bg-[#1e1e1e]" : "bg-white")}
            onInput={() => onDirty?.(activePath)}
          >
            <code>
              {highlighted.map((line, i) => (
                <div key={i} dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }} />
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
