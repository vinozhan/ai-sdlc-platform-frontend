import { cn } from "@/shared/utils/cn";
import type { FlowLink, FlowScreen } from "../../fixtures/wireframeFlows";

export function ScreenPreview({
  screen,
  showLinks,
  onNavigate,
  isDark,
}: {
  screen: FlowScreen;
  showLinks: boolean;
  onNavigate: (targetId: string) => void;
  isDark: boolean;
}) {
  const linkBtn = (link: FlowLink) => {
    const base = cn(
      "transition-all",
      showLinks && "ring-2 ring-blue-400 ring-offset-1",
      isDark ? "ring-offset-[#1e1e2e]" : "ring-offset-white"
    );

    if (link.variant === "row") {
      return (
        <button
          key={link.id}
          type="button"
          onClick={() => onNavigate(link.targetId)}
          className={cn(
            base,
            "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm",
            isDark ? "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.06]" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          )}
        >
          {link.label}
          <span className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>→</span>
        </button>
      );
    }

    if (link.variant === "secondary") {
      return (
        <button
          key={link.id}
          type="button"
          onClick={() => onNavigate(link.targetId)}
          className={cn(
            base,
            "rounded-lg border px-4 py-2.5 text-sm font-medium",
            isDark ? "border-blue-500/40 text-blue-300 hover:bg-blue-500/10" : "border-blue-200 text-blue-700 hover:bg-blue-50"
          )}
        >
          {link.label}
        </button>
      );
    }

    if (link.variant === "text") {
      return (
        <button
          key={link.id}
          type="button"
          onClick={() => onNavigate(link.targetId)}
          className={cn(base, "text-sm text-blue-600 hover:underline dark:text-blue-400")}
        >
          {link.label}
        </button>
      );
    }

    return (
      <button
        key={link.id}
        type="button"
        onClick={() => onNavigate(link.targetId)}
        className={cn(base, "rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500")}
      >
        {link.label}
      </button>
    );
  };

  const isProducts = screen.id === "products";
  const isCart = screen.id === "cart";
  const isCheckout = screen.id === "checkout";
  const isConfirmation = screen.id === "confirmation";
  const isLogin = screen.id === "login";
  const isDashboard = screen.id === "dashboard";
  const isKycUpload = screen.id === "upload";
  const isKycReview = screen.id === "review";

  return (
    <div className="space-y-4">
      {(isProducts || isCart || isCheckout) && (
        <div className={cn("rounded-lg border p-4", isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-50")}>
          {isProducts && (
            <div className="space-y-2">
              {screen.links.filter((l) => l.variant === "row").map(linkBtn)}
            </div>
          )}
          {isCart && (
            <>
              <div className="space-y-2">
                {screen.links.filter((l) => l.variant === "row").map(linkBtn)}
              </div>
              <div className={cn("mt-4 flex items-center justify-between border-t pt-3 text-sm font-semibold", isDark ? "border-white/10 text-white" : "border-slate-200 text-slate-900")}>
                <span>Total</span>
                <span>$68.00</span>
              </div>
            </>
          )}
          {isCheckout && (
            <div className="space-y-3">
              <input readOnly placeholder="Card number" defaultValue="4242 4242 4242 4242" className={cn("w-full rounded-lg border px-3 py-2 text-sm", isDark ? "border-white/10 bg-white/[0.04] text-slate-300" : "border-slate-200 bg-white text-slate-700")} />
              <div className="flex gap-2">
                <input readOnly placeholder="MM/YY" className={cn("w-1/2 rounded-lg border px-3 py-2 text-sm", isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-white")} />
                <input readOnly placeholder="CVC" className={cn("w-1/2 rounded-lg border px-3 py-2 text-sm", isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-white")} />
              </div>
            </div>
          )}
        </div>
      )}

      {isConfirmation && (
        <div className={cn("rounded-lg border p-6 text-center", isDark ? "border-emerald-500/30 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50")}>
          <p className={cn("text-lg font-semibold", isDark ? "text-emerald-300" : "text-emerald-800")}>Payment successful</p>
          <p className={cn("mt-1 text-sm", isDark ? "text-slate-400" : "text-slate-600")}>Order #PF-2847 confirmed</p>
        </div>
      )}

      {isLogin && (
        <div className={cn("rounded-lg border p-4 space-y-3", isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-50")}>
          <input readOnly placeholder="Email" className={cn("w-full rounded-lg border px-3 py-2 text-sm", isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-white")} />
          <input readOnly type="password" placeholder="Password" className={cn("w-full rounded-lg border px-3 py-2 text-sm", isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-white")} />
        </div>
      )}

      {isDashboard && (
        <div className={cn("rounded-lg border p-4", isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-50")}>
          <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>Welcome back</p>
          <p className={cn("mt-1 text-xs", isDark ? "text-slate-500" : "text-slate-500")}>3 active subscriptions · $87/mo MRR</p>
        </div>
      )}

      {(isKycUpload || isKycReview) && (
        <div className={cn("rounded-lg border p-4 text-center", isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-50")}>
          <p className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-600")}>
            {isKycUpload ? "Upload a government-issued ID to verify your account." : "Your documents are being reviewed (1-2 business days)."}
          </p>
        </div>
      )}

      {!isProducts && !isCart && !isCheckout && !isConfirmation && !isLogin && !isDashboard && !isKycUpload && !isKycReview && (
        <div className={cn("rounded-lg border p-4", isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-50")}>
          <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
            Interactive prototype preview for {screen.name}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {screen.links.filter((l) => l.variant !== "row").map(linkBtn)}
      </div>
    </div>
  );
}
