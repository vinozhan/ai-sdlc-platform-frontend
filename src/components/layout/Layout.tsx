import { type ReactNode, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
  User,
  GitBranch,
  Cloud,
  Brain,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/utils/cn";

const mainNav = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "projects", label: "Projects", icon: FolderKanban, path: "/projects" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, projects, settings, setActiveProjectId } = useStore();
  const isDark = theme === "dark";
  const recent = projects.slice(0, 5);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <aside
      className={cn(
        "flex w-[252px] shrink-0 flex-col border-r transition-colors",
        isDark ? "border-white/[0.06] bg-[#0a0e18]" : "border-slate-200/90 bg-white"
      )}
    >
      <div className="flex h-14 items-center gap-2.5 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 shadow-lg shadow-violet-500/25">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className={cn("truncate text-sm font-semibold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
            SDLC AI
          </p>
          <p className={cn("truncate text-[10px]", isDark ? "text-slate-500" : "text-slate-400")}>Orchestrator</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pt-2">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all",
                active
                  ? isDark
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "bg-slate-100 text-slate-900 shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && (isDark ? "text-violet-400" : "text-violet-600"))} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        {recent.length > 0 && (
          <div className="pt-5">
            <p
              className={cn(
                "mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider",
                isDark ? "text-slate-600" : "text-slate-400"
              )}
            >
              Recent projects
            </p>
            {recent.map((p) => {
              const active = location.pathname.includes(`/projects/${p.id}`);
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    navigate(`/projects/${p.id}/requirements`);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-colors",
                    active
                      ? isDark
                        ? "bg-white/[0.06] text-white"
                        : "bg-slate-100 text-slate-900"
                      : isDark
                      ? "text-slate-400 hover:bg-white/[0.04]"
                      : "text-slate-500 hover:bg-slate-50"
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

      <div className={cn("space-y-2 border-t p-3", isDark ? "border-white/[0.06]" : "border-slate-100")}>
        <Link
          to="/settings"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-colors",
            isDark ? "text-slate-400 hover:bg-white/[0.04]" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <User className="h-4 w-4" />
          Profile & integrations
        </Link>
        <div className={cn("space-y-1.5 rounded-xl px-3 py-2.5", isDark ? "bg-white/[0.03]" : "bg-slate-50")}>
          <div className="flex items-center gap-2 text-[11px]">
            <GitBranch className={cn("h-3 w-3", settings.git.connected ? "text-emerald-500" : "text-slate-400")} />
            <span className={isDark ? "text-slate-300" : "text-slate-600"}>
              Git {settings.git.connected ? "connected" : "not connected"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <Cloud className={cn("h-3 w-3", settings.vercel.connected ? "text-emerald-500" : "text-slate-400")} />
            <span className={isDark ? "text-slate-300" : "text-slate-600"}>
              Vercel {settings.vercel.connected ? "connected" : "not connected"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <Brain className="h-3 w-3 text-violet-500" />
            <span className={isDark ? "text-slate-400" : "text-slate-500"}>{settings.ai.model}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  const navigate = useNavigate();
  const { setCommandPaletteOpen, addToast, theme, toggleTheme, settings, projects } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const isDark = theme === "dark";
  const location = useLocation();

  const title = (() => {
    if (location.pathname === "/") return "Home";
    if (location.pathname.startsWith("/projects/new")) return "New project";
    if (location.pathname.startsWith("/projects/") && location.pathname.includes("/requirements"))
      return "Requirements & Design";
    if (location.pathname.startsWith("/projects/") && location.pathname.includes("/code")) return "Code Generation";
    if (location.pathname.startsWith("/projects/") && location.pathname.includes("/testing")) return "Testing & Security";
    if (location.pathname.startsWith("/projects/") && location.pathname.includes("/deployment")) return "Deployment";
    if (location.pathname.startsWith("/projects/") && location.pathname.includes("/traceability")) return "Traceability";
    if (location.pathname.startsWith("/projects")) return "Projects";
    if (location.pathname.startsWith("/settings")) return "Settings";
    return "SDLC AI";
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
        "flex h-14 shrink-0 items-center gap-3 border-b px-6 backdrop-blur-xl",
        isDark ? "border-white/[0.06] bg-[#0a0e18]/85" : "border-slate-200/80 bg-white/85"
      )}
    >
      <h1 className={cn("truncate text-[15px] font-semibold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
        {title}
      </h1>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className={cn(
          "ml-auto flex h-9 w-64 items-center gap-2 rounded-full border px-3.5 text-[13px] transition-all",
          isDark
            ? "border-white/10 bg-white/[0.04] text-slate-500 hover:border-white/15"
            : "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-white"
        )}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search...</span>
        <kbd
          className={cn(
            "flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px]",
            isDark ? "border-white/10 bg-white/5 text-slate-500" : "border-slate-200 bg-white text-slate-400"
          )}
        >
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <button
        onClick={toggleTheme}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
          isDark
            ? "border-white/10 bg-white/[0.04] text-slate-400 hover:text-amber-300"
            : "border-slate-200 bg-slate-50 text-slate-500 hover:text-violet-600"
        )}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[9px] font-bold text-white">
            {alerts.length}
          </span>
        </button>
        {showNotifications && (
          <div
            className={cn(
              "absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border shadow-2xl",
              isDark ? "border-white/10 bg-[#121826]" : "border-slate-200 bg-white"
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

      <button
        onClick={() => navigate("/settings")}
        className={cn(
          "flex h-9 items-center gap-2 rounded-full border pl-1 pr-3 transition-colors",
          isDark ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]" : "border-slate-200 bg-slate-50 hover:bg-white"
        )}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-[10px] font-bold text-white">
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

  return (
    <div className={cn("flex h-screen overflow-hidden transition-colors", isDark ? "bg-[#070a12]" : "bg-[#f4f5f7]")}>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
