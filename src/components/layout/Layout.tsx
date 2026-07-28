import { type ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  FolderKanban,
  Settings,
  Search,
  Bell,
  Command,
  AlertTriangle,
  Info,
  X,
  Sparkles,
  Sun,
  Moon,
  Plus,
  ChevronsLeft,
  ChevronsRight,
  Menu,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/utils/cn";

const mainNav = [
  { id: "home", label: "Home", icon: Home, path: "/workspace" },
  { id: "projects", label: "Projects", icon: FolderKanban, path: "/projects" },
];

function Sidebar({
  collapsed,
  onNavigate,
  className,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, projects, setActiveProjectId } = useStore();
  const isDark = theme === "dark";
  const recent = projects.slice(0, 5);

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const isActive = (path: string) => {
    if (path === "/workspace") return location.pathname === "/workspace";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[252px]",
        isDark ? "border-white/[0.06] bg-[#0a1628]" : "border-slate-200/90 bg-white",
        className
      )}
    >
      <div className={cn("flex h-14 shrink-0 items-center border-b", collapsed ? "justify-center px-2" : "gap-2.5 px-4", isDark ? "border-white/[0.06]" : "border-slate-200/80")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-lg shadow-blue-500/25">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className={cn("truncate text-sm font-semibold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
              SDLC AI
            </p>
            <p className={cn("truncate text-[10px]", isDark ? "text-slate-500" : "text-slate-400")}>Orchestrator</p>
          </div>
        )}
        {onNavigate && !collapsed && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close menu"
            className={cn(
              "ml-auto flex h-8 w-8 items-center justify-center rounded-lg lg:hidden",
              isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className={cn("pb-3 pt-4", collapsed ? "px-2" : "px-3")}>
        <button
          onClick={() => go("/projects/new")}
          title="New project"
          className={cn(
            "flex items-center justify-center border-2 border-blue-600 bg-white font-semibold text-blue-600 transition-all",
            collapsed
              ? "mx-auto h-10 w-10 rounded-full"
              : "w-full gap-2 rounded-full px-3 py-2.5 text-[13px]"
          )}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">New project</span>}
        </button>
      </div>

      <nav className={cn("flex-1 space-y-0.5 overflow-y-auto pt-2", collapsed ? "px-2" : "px-3")}>
        {mainNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => go(item.path)}
              title={item.label}
              className={cn(
                "flex w-full items-center rounded-xl py-2 text-[13px] font-medium transition-all",
                collapsed ? "justify-center px-0" : "gap-2.5 px-3",
                active
                  ? isDark
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "bg-blue-50 text-blue-900 shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  : "text-slate-500 hover:bg-blue-50/50 hover:text-slate-800"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && (isDark ? "text-blue-400" : "text-blue-600"))} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}

        {recent.length > 0 && !collapsed && (
          <div className="pt-5">
            <p
              className={cn(
                "mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider",
                isDark ? "text-slate-600" : "text-slate-400"
              )}
            >
              Favourites
            </p>
            {recent.map((p) => {
              const active = location.pathname.includes(`/projects/${p.id}`);
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    go(`/projects/${p.id}/requirements`);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-colors",
                    active
                      ? isDark
                        ? "bg-white/[0.06] text-white"
                        : "bg-blue-50 text-blue-900"
                      : isDark
                      ? "text-slate-400 hover:bg-white/[0.04]"
                      : "text-slate-500 hover:bg-blue-50/50"
                  )}
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="flex-1 truncate text-left">{p.name}</span>
                  <span className={cn("text-[10px] tabular-nums", isDark ? "text-slate-600" : "text-slate-400")}>
                    {p.progress}%
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      <div className={cn("border-t p-3", isDark ? "border-white/[0.06]" : "border-slate-100", collapsed && "px-2")}>
        <button
          onClick={() => go("/settings")}
          title="Settings"
          className={cn(
            "flex w-full items-center rounded-xl py-2 text-[13px] font-medium transition-all",
            collapsed ? "justify-center px-0" : "gap-2.5 px-3",
            isActive("/settings")
              ? isDark
                ? "bg-white/[0.08] text-white shadow-sm"
                : "bg-blue-50 text-blue-900 shadow-sm"
              : isDark
              ? "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              : "text-slate-500 hover:bg-blue-50/50 hover:text-slate-800"
          )}
        >
          <Settings className={cn("h-4 w-4 shrink-0", isActive("/settings") && (isDark ? "text-blue-400" : "text-blue-600"))} />
          {!collapsed && <span className="truncate">Settings</span>}
        </button>
      </div>
    </aside>
  );
}

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const { setCommandPaletteOpen, addToast, theme, toggleTheme, settings, projects, logout } = useStore();
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
    return "SDLC AI";
  })();

  const mobileTitle = (() => {
    if (location.pathname.startsWith("/projects/") && location.pathname.includes("/requirements")) return "Design";
    if (location.pathname.startsWith("/projects/") && location.pathname.includes("/code")) return "Code";
    if (location.pathname.startsWith("/projects/") && location.pathname.includes("/testing")) return "Testing";
    if (location.pathname.startsWith("/projects/") && location.pathname.includes("/deployment")) return "Deploy";
    if (location.pathname.startsWith("/projects/") && location.pathname.includes("/traceability")) return "Activity";
    return title;
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
        "safe-top safe-x flex h-14 shrink-0 items-center gap-1.5 border-b px-3 backdrop-blur-xl sm:gap-2 sm:px-4 md:gap-3 md:px-6",
        isDark ? "border-white/[0.06] bg-[#0a1628]/85" : "border-slate-200/80 bg-white/95"
      )}
    >
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors lg:hidden",
          isDark
            ? "border-white/10 bg-white/[0.04] text-slate-400 active:bg-white/[0.08]"
            : "border-slate-200 bg-white text-slate-500 active:bg-slate-50"
        )}
      >
        <Menu className="h-4 w-4" />
      </button>

      <h1
        className={cn(
          "ml-3 min-w-0 flex-1 truncate text-sm font-semibold tracking-tight sm:ml-4 sm:text-[15px] md:max-w-none md:flex-none",
          isDark ? "text-white" : "text-slate-900"
        )}
      >
        <span className="sm:hidden">{mobileTitle}</span>
        <span className="hidden sm:inline">{title}</span>
      </h1>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        aria-label="Search"
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all md:ml-auto md:h-9 md:w-64 md:justify-start md:gap-2 md:px-3.5",
          isDark
            ? "border-white/10 bg-white/[0.04] text-slate-500 active:bg-white/[0.08]"
            : "border-slate-200 bg-white text-slate-400 active:bg-blue-50/50"
        )}
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden flex-1 text-left text-[13px] md:inline">Search...</span>
        <kbd
          className={cn(
            "hidden items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] md:flex",
            isDark ? "border-white/10 bg-white/5 text-slate-500" : "border-slate-200 bg-white text-slate-400"
          )}
        >
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className={cn(
          "hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors sm:flex md:h-9 md:w-9",
          isDark
            ? "border-white/10 bg-white/[0.04] text-slate-400 hover:text-amber-300"
            : "border-slate-200 bg-white text-slate-500 hover:text-blue-600"
        )}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="relative shrink-0">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          aria-label="Notifications"
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors md:h-9 md:w-9",
            isDark ? "border-white/10 bg-white/[0.04] text-slate-400 active:bg-white/[0.08]" : "border-slate-200 bg-slate-50 text-slate-500 active:bg-white"
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
              "absolute right-0 top-11 z-50 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-2xl border shadow-2xl sm:w-80",
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
                      className={cn("mt-0.5 h-4 w-4 shrink-0", alert.severity === "warning" ? "text-amber-500" : "text-blue-500")}
                    />
                    <div className="min-w-0">
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

      <button
        type="button"
        title="Log out"
        onClick={() => {
          logout();
          addToast({ type: "info", title: "Signed out", message: "You have been logged out successfully" });
          navigate("/login");
        }}
        className={cn(
          "flex h-10 shrink-0 items-center gap-2 rounded-full border pl-1 pr-2 transition-colors sm:h-9 sm:pr-3",
          isDark ? "border-white/10 bg-white/[0.04] active:bg-white/[0.06]" : "border-slate-200 bg-slate-50 active:bg-white"
        )}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-[10px] font-bold text-white">
          {settings.profile.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <span className={cn("hidden text-xs font-medium sm:inline", isDark ? "text-slate-300" : "text-slate-700")}>
          {settings.profile.name.split(" ")[0]}
        </span>
      </button>
    </header>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={cn("relative flex h-screen overflow-hidden transition-colors", isDark ? "bg-[#071018]" : "bg-white")}>
      <div className="hidden shrink-0 lg:flex">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
          <div className="mobile-drawer-in fixed inset-y-0 left-0 z-50 shadow-2xl lg:hidden">
            <Sidebar collapsed={false} onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setSidebarCollapsed((prev) => !prev)}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "absolute top-4 z-40 hidden h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/25 transition-all duration-300 ease-in-out hover:bg-blue-500 lg:flex",
          sidebarCollapsed ? "left-[68px]" : "left-[252px]"
        )}
      >
        {sidebarCollapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="relative flex-1 overflow-auto">
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 z-0 h-72 bg-gradient-to-b",
              isDark ? "from-blue-500/[0.07] to-transparent" : "from-blue-100/60 to-transparent"
            )}
          />
          <div className="relative z-[1] min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
