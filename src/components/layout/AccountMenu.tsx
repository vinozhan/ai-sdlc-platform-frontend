import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronsUpDown, LogOut, Moon, Settings, Sun } from "lucide-react";
import { cn } from "@/utils/cn";
import { useStore } from "@/store/useStore";
import { UserAvatar } from "@/components/brand/UserAvatar";

function MenuItem({
  icon,
  children,
  onClick,
  active,
  destructive,
  isDark,
}: {
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  destructive?: boolean;
  isDark: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-colors",
        destructive
          ? isDark
            ? "text-red-400 hover:bg-red-500/10"
            : "text-red-600 hover:bg-red-50"
          : active
          ? isDark
            ? "bg-white/[0.08] text-white"
            : "bg-blue-50 text-blue-900"
          : isDark
          ? "text-slate-300 hover:bg-white/[0.04]"
          : "text-slate-600 hover:bg-slate-50"
      )}
    >
      {icon}
      <span className="truncate">{children}</span>
    </button>
  );
}

/**
 * The account row at the foot of the sidebar: who you are signed in as, and
 * everything that belongs to the account behind one click - settings, theme,
 * sign out. It replaces the standalone Settings link so there is one place for
 * "things about me" rather than two.
 */
export function AccountMenu({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, settings, logout, addToast } = useStore();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const { name, email } = settings.profile;
  const onSettings = location.pathname.startsWith("/settings");

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title={collapsed ? `${name} · ${email}` : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center rounded-xl transition-all",
          collapsed ? "justify-center px-0 py-1.5" : "gap-2.5 px-2 py-2",
          open || onSettings
            ? isDark
              ? "bg-white/[0.08]"
              : "bg-blue-50"
            : isDark
            ? "hover:bg-white/[0.04]"
            : "hover:bg-blue-50/50"
        )}
      >
        <UserAvatar size="sm" />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 text-left">
              <span className={cn("block truncate text-[13px] font-medium", isDark ? "text-white" : "text-slate-900")}>
                {name}
              </span>
              <span className={cn("block truncate text-[11px]", isDark ? "text-slate-500" : "text-slate-400")}>
                {email}
              </span>
            </span>
            <ChevronsUpDown className={cn("h-3.5 w-3.5 shrink-0", isDark ? "text-slate-500" : "text-slate-400")} />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className={cn(
            "absolute bottom-full z-50 mb-2 overflow-hidden rounded-2xl border p-1.5 shadow-2xl",
            collapsed ? "left-0 w-56" : "left-0 right-0",
            isDark ? "border-white/10 bg-[#0f1d32]" : "border-slate-200 bg-white"
          )}
        >
          {collapsed && (
            <div className={cn("border-b px-2.5 pb-2 pt-1", isDark ? "border-white/[0.06]" : "border-slate-100")}>
              <p className={cn("truncate text-[13px] font-medium", isDark ? "text-white" : "text-slate-900")}>{name}</p>
              <p className={cn("truncate text-[11px]", isDark ? "text-slate-500" : "text-slate-400")}>{email}</p>
            </div>
          )}

          <div className={cn("space-y-0.5", collapsed && "pt-1.5")}>
            <MenuItem
              isDark={isDark}
              active={onSettings}
              icon={<Settings className="h-4 w-4 shrink-0" />}
              onClick={() => {
                close();
                navigate("/settings");
              }}
            >
              Settings
            </MenuItem>

            <MenuItem
              isDark={isDark}
              icon={isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
              onClick={() => {
                toggleTheme();
                close();
              }}
            >
              {isDark ? "Switch to light" : "Switch to dark"}
            </MenuItem>
          </div>

          <div className={cn("my-1.5 h-px", isDark ? "bg-white/[0.06]" : "bg-slate-100")} />

          <MenuItem
            isDark={isDark}
            destructive
            icon={<LogOut className="h-4 w-4 shrink-0" />}
            onClick={() => {
              close();
              logout();
              addToast({ type: "info", title: "Signed out", message: "You have been logged out successfully" });
              navigate("/login");
            }}
          >
            Sign out
          </MenuItem>
        </div>
      )}
    </div>
  );
}
