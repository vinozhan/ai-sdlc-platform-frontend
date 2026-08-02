import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useUiStore } from "@/store/ui";
import { useProjectsList } from "@/entities/project";
import { cn } from "@/shared/utils/cn";

export function CommandPalette() {
  const commandPaletteOpen = useUiStore((s) => s.commandPaletteOpen);
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const theme = useUiStore((s) => s.theme);
  const projects = useProjectsList();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const commands = [
    { id: "home", label: "Go to Home", path: "/workspace", category: "Navigation" },
    { id: "projects", label: "Projects", path: "/projects", category: "Navigation" },
    { id: "new", label: "Create new project", path: "/projects/new", category: "Action" },
    { id: "settings", label: "Settings", path: "/settings", category: "Navigation" },
    ...projects.slice(0, 8).map((p) => ({
      id: p.id,
      label: p.name,
      path: `/projects/${p.id}/requirements`,
      category: "Projects",
    })),
  ];

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (!commandPaletteOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCommandPaletteOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, Math.max(filtered.length - 1, 0)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filtered[selected];
        if (cmd) {
          navigate(cmd.path);
          setCommandPaletteOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandPaletteOpen, query, selected, navigate, setCommandPaletteOpen, filtered]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-4 pt-[15vh] dark:bg-black/60"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className={cn(
          "w-full max-w-xl rounded-2xl border shadow-2xl",
          isDark ? "border-white/10 bg-[#0f1d32]" : "border-slate-200 bg-white"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn("flex items-center gap-2 border-b px-4", isDark ? "border-white/5" : "border-slate-100")}>
          <Search className={cn("h-4 w-4", isDark ? "text-slate-500" : "text-slate-400")} />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            placeholder="Search projects and pages..."
            className={cn(
              "h-12 flex-1 bg-transparent text-sm focus:outline-none",
              isDark ? "text-white placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"
            )}
          />
          <button onClick={() => setCommandPaletteOpen(false)}>
            <X className={cn("h-4 w-4", isDark ? "text-slate-500" : "text-slate-400")} />
          </button>
        </div>
        <div className="max-h-80 overflow-auto p-2">
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onMouseEnter={() => setSelected(i)}
              onClick={() => {
                navigate(cmd.path);
                setCommandPaletteOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                selected === i
                  ? isDark
                    ? "bg-white/10 text-white"
                    : "bg-slate-100 text-slate-900"
                  : isDark
                  ? "text-slate-300"
                  : "text-slate-600"
              )}
            >
              <span className={cn("text-[10px] uppercase", isDark ? "text-slate-500" : "text-slate-400")}>
                {cmd.category}
              </span>
              <span>{cmd.label}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className={cn("px-3 py-4 text-center text-sm", isDark ? "text-slate-500" : "text-slate-400")}>
              No results found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
