import { type ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useUiStore } from "@/store/ui";
import { Sidebar } from "@/app/layout/Sidebar";
import { TopBar } from "@/app/layout/TopBar";
import { cn } from "@/shared/utils/cn";

export function AppShell({ children }: { children: ReactNode }) {
  const theme = useUiStore((s) => s.theme);
  const isDark = theme === "dark";
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  // Track whether the sidebar is currently the drawer, so the dialog semantics
  // only apply when it actually behaves like one.
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => typeof window !== "undefined" && !window.matchMedia("(min-width: 768px)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const sync = () => {
      setIsMobileViewport(!query.matches);
      if (query.matches) setMobileOpen(false);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close drawer when resizing to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Escape closes the drawer and focus returns to the trigger, as with any
  // modal surface.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      menuTriggerRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className={cn("relative flex h-[100dvh] overflow-hidden transition-colors", isDark ? "bg-[#071018]" : "bg-white")}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        isMobileViewport={isMobileViewport}
        onNavigate={() => setMobileOpen(false)}
      />

      <button
        type="button"
        onClick={() => setSidebarCollapsed((prev) => !prev)}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "absolute top-4 z-40 hidden h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/25 transition-all duration-300 ease-in-out hover:bg-blue-500 md:flex",
          sidebarCollapsed ? "left-[68px]" : "left-[252px]"
        )}
      >
        {sidebarCollapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar onOpenMobileNav={() => setMobileOpen(true)} mobileOpen={mobileOpen} menuTriggerRef={menuTriggerRef} />
        <main className="relative flex-1 overflow-auto overscroll-contain">
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 z-0 h-72 bg-gradient-to-b",
              isDark ? "from-blue-500/[0.07] to-transparent" : "from-blue-100/60 to-transparent"
            )}
          />
          <div className="relative z-[1] min-h-full min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}

export { AppShell as Layout };
