import { useState, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { Search, Bell, Command, AlertTriangle, Info, X, Menu } from "lucide-react";
import { useUiStore } from "@/store/ui";
import { useProjectsList } from "@/entities/project";
import { useSettings } from "@/entities/settings";
import { cn } from "@/shared/utils/cn";

export function TopBar({
  onOpenMobileNav,
  mobileOpen,
  menuTriggerRef,
}: {
  onOpenMobileNav: () => void;
  mobileOpen: boolean;
  menuTriggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const addToast = useUiStore((s) => s.addToast);
  const theme = useUiStore((s) => s.theme);
  const settings = useSettings();
  const projects = useProjectsList();
  const [showNotifications, setShowNotifications] = useState(false);
  const isDark = theme === "dark";
  const location = useLocation();

  const title = (() => {
    if (location.pathname === "/workspace") return "Home";
    if (location.pathname.startsWith("/projects/new")) return "New project";
    if (location.pathname.startsWith("/projects/") && location.pathname.includes("/requirements"))
      return "Requirements & Design";
    if (location.pathname.startsWith("/projects/") && location.pathname.includes("/code")) return "Code Generation";
    if (location.pathname.startsWith("/projects/") && location.pathname.includes("/testing")) return "Testing & Security";
    if (location.pathname.startsWith("/projects/") && location.pathname.includes("/deployment")) return "Deployment";
    if (location.pathname.startsWith("/projects/") && location.pathname.includes("/traceability")) return "Activity Log";
    if (location.pathname.startsWith("/projects")) return "Projects";
    if (location.pathname.startsWith("/settings")) return "Settings";
    return "Nexus";
  })();

  const alerts = [
    {
      id: "1",
      severity: "warning" as const,
      title: "Approval needed",
      message: projects[0] ? `${projects[0].name} has a pending design review` : "Connect integrations in Settings",
    },
    {
      id: "2",
      severity: "info" as const,
      title: "AI model ready",
      message: `${settings.ai.model} is configured for generation`,
    },
  ];

  return (
    <header
      className={cn(
        "relative z-30 flex h-14 shrink-0 items-center gap-2 border-b px-3 backdrop-blur-xl sm:gap-3 sm:px-6",
        isDark ? "border-white/[0.06] bg-[#0a1628]/85" : "border-slate-200/80 bg-white/95"
      )}
    >
      <button
        type="button"
        ref={menuTriggerRef}
        onClick={onOpenMobileNav}
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={mobileOpen}
        aria-controls="app-sidebar"
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border md:hidden",
          isDark ? "border-white/10 bg-white/[0.04] text-slate-300" : "border-slate-200 bg-white text-slate-600"
        )}
      >
        <Menu className="h-4 w-4" />
      </button>

      <h1
        className={cn(
          "min-w-0 truncate text-[14px] font-semibold tracking-tight sm:text-[15px]",
          isDark ? "text-white" : "text-slate-900"
        )}
      >
        {title}
      </h1>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className={cn(
          "ml-auto flex h-9 items-center gap-2 rounded-full border px-2.5 text-[13px] transition-all sm:w-64 sm:px-3.5",
          isDark
            ? "border-white/10 bg-white/[0.04] text-slate-500 hover:border-white/15"
            : "border-slate-200 bg-white text-slate-400 hover:border-blue-200 hover:bg-blue-50/30"
        )}
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden flex-1 text-left sm:inline">Search...</span>
        <kbd
          className={cn(
            "hidden items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] sm:flex",
            isDark ? "border-white/10 bg-white/5 text-slate-500" : "border-slate-200 bg-white text-slate-400"
          )}
        >
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
            isDark ? "border-white/10 bg-white/[0.04] text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"
          )}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
            {alerts.length}
          </span>
        </button>
        {showNotifications && (
          <div
            className={cn(
              "absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border shadow-2xl isolate",
              isDark ? "border-white/10 bg-[#0f1d32]" : "border-slate-200 bg-white"
            )}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}
            >
              <span className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>Notifications</span>
              <button onClick={() => setShowNotifications(false)}>
                <X className={cn("h-4 w-4", isDark ? "text-slate-500" : "text-slate-400")} />
              </button>
            </div>
            <div className="max-h-80 space-y-0.5 p-2">
              {alerts.map((alert) => {
                const Icon = alert.severity === "warning" ? AlertTriangle : Info;
                return (
                  <button
                    key={alert.id}
                    onClick={() => {
                      addToast({ type: "info", title: alert.title, message: alert.message });
                      setShowNotifications(false);
                    }}
                    className={cn(
                      "flex w-full gap-3 rounded-xl p-2.5 text-left",
                      isDark ? "hover:bg-white/[0.04]" : "hover:bg-slate-50"
                    )}
                  >
                    <Icon
                      className={cn("mt-0.5 h-4 w-4", alert.severity === "warning" ? "text-amber-500" : "text-blue-500")}
                    />
                    <div>
                      <p className={cn("text-[13px] font-medium", isDark ? "text-slate-200" : "text-slate-800")}>
                        {alert.title}
                      </p>
                      <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>{alert.message}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
