import { useEffect, useState } from "react";
import { X, Send } from "lucide-react";
import { cn } from "@/utils/cn";
import type { FlowLink, FlowScreen, WireframeFlow } from "@/data/wireframeFlows";

function ScreenPreview({ screen, showLinks, onNavigate, isDark }: {
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
            {isKycUpload ? "Upload a government-issued ID to verify your account." : "Your documents are being reviewed (1–2 business days)."}
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

export function WireframeMockupModal({
  flow,
  version,
  isOpen,
  isDark,
  onClose,
  onApprove,
  onRequestRefinement,
}: {
  flow: WireframeFlow;
  version: string;
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onApprove: () => void;
  onRequestRefinement: (feedback: string) => void;
}) {
  const [screenIndex, setScreenIndex] = useState(0);
  const [showLinks, setShowLinks] = useState(false);
  const [refinementMode, setRefinementMode] = useState(false);
  const [feedback, setFeedback] = useState("");

  const screen = flow.screens[screenIndex];

  useEffect(() => {
    if (isOpen) {
      setScreenIndex(0);
      setShowLinks(false);
      setRefinementMode(false);
      setFeedback("");
    }
  }, [isOpen, flow.id]);

  const navigateTo = (targetId: string) => {
    const idx = flow.screens.findIndex((s) => s.id === targetId);
    if (idx >= 0) setScreenIndex(idx);
  };

  const handleSendRefinement = () => {
    const text = feedback.trim();
    if (!text) return;
    onRequestRefinement(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-label="Close modal" />

      <div
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full max-w-[800px] flex-col overflow-hidden rounded-2xl shadow-2xl",
          isDark ? "border border-white/10 bg-[#0f172a]" : "border border-slate-200 bg-white"
        )}
      >
        {/* Header */}
        <div className={cn("border-b px-6 py-4", isDark ? "border-white/10" : "border-slate-100")}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                Click through the flow
              </h2>
              <p className={cn("mt-1 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                Anything outlined is clickable, exactly like the real app will be.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <label className={cn("flex items-center gap-2 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                <input
                  type="checkbox"
                  checked={showLinks}
                  onChange={(e) => setShowLinks(e.target.checked)}
                  className="rounded border-slate-300 accent-blue-600"
                />
                Show links
              </label>
              <button
                type="button"
                onClick={onClose}
                className={cn("rounded-lg p-1.5 transition-colors", isDark ? "hover:bg-white/10" : "hover:bg-slate-100")}
              >
                <X className={cn("h-5 w-5", isDark ? "text-slate-400" : "text-slate-500")} />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {refinementMode ? (
            <div className="space-y-4">
              <p className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-600")}>
                Describe what should change about the <strong>{flow.wireframeKey}</strong> flow:
              </p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                placeholder="Describe what should change about this flow..."
                className={cn(
                  "w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/30",
                  isDark ? "border-white/10 bg-white/[0.04] text-slate-200 placeholder:text-slate-500" : "border-slate-200 bg-white text-slate-800"
                )}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSendRefinement}
                  disabled={!feedback.trim()}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => setRefinementMode(false)}
                  className={cn("rounded-lg border px-4 py-2 text-sm", isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-600")}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={cn("rounded-xl border", isDark ? "border-white/10" : "border-slate-200")}>
              <div className={cn("border-b px-4 py-3", isDark ? "border-white/10" : "border-slate-100")}>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>{screen.name}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-50 text-blue-700")}>
                    {version}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  {screen.breadcrumb.map((crumb, i) => (
                    <span key={crumb} className="flex items-center gap-1.5">
                      {i > 0 && <span className={cn("text-[10px]", isDark ? "text-slate-600" : "text-slate-300")}>›</span>}
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", isDark ? "bg-white/[0.06] text-slate-400" : "bg-slate-100 text-slate-600")}>
                        {crumb}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <ScreenPreview screen={screen} showLinks={showLinks} onNavigate={navigateTo} isDark={isDark} />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!refinementMode && (
          <div className={cn("flex gap-3 border-t px-6 py-3", isDark ? "border-white/10" : "border-slate-100")}>
            <button
              type="button"
              onClick={onApprove}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Approve Design
            </button>
            <button
              type="button"
              onClick={() => setRefinementMode(true)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-semibold",
                isDark ? "border-blue-500/40 text-blue-300 hover:bg-blue-500/10" : "border-blue-200 text-blue-700 hover:bg-blue-50"
              )}
            >
              Request Refinements
            </button>
          </div>
        )}

        {/* Step indicator */}
        {!refinementMode && (
          <div className={cn("flex items-center justify-between border-t px-6 py-3", isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-100 bg-slate-50/50")}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {flow.screens.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScreenIndex(i)}
                    className={cn(
                      "rounded-full transition-all",
                      i === screenIndex ? "h-2.5 w-2.5 bg-blue-600" : "h-2 w-2 bg-slate-300 dark:bg-slate-600"
                    )}
                    aria-label={s.name}
                  />
                ))}
              </div>
              <span className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-slate-700")}>{screen.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setScreenIndex(0)}
              className={cn("text-xs font-medium text-blue-600 hover:underline dark:text-blue-400")}
            >
              Restart flow
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
