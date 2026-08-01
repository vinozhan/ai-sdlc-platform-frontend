import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, FlaskConical } from "lucide-react";
import { cn } from "@/utils/cn";
import { setScenario, scenarioLabels, type Scenario } from "@/lib/orchestrator";
import { useScenario } from "@/lib/useScenario";

const order: Scenario[] = [
  "live",
  "never-deployed",
  "deploying",
  "proofs-running",
  "provisioning-failure",
  "degraded",
  "disconnected",
];

/**
 * Says plainly that nothing here talks to a real provider, and doubles as the
 * switch between the states this phase has to handle. Both jobs belong on the
 * same control: the states are only reachable because the data is fixtures.
 */
export function DemoBadge() {
  const scenario = useScenario();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/[0.08] px-2.5 py-1.5 text-[11.5px] font-medium text-amber-600 transition-colors hover:bg-amber-500/[0.14] dark:text-amber-300"
      >
        <FlaskConical className="h-3.5 w-3.5" />
        Demo data
        <span className="hidden text-amber-600/70 sm:inline dark:text-amber-300/70">
          {scenarioLabels[scenario]}
        </span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1.5 w-64 overflow-hidden rounded-xl border border-[color:var(--tp-line)] bg-[color:var(--tp-surface)] shadow-lg"
        >
          <p className="tp-den border-b border-[color:var(--tp-line)] px-3 py-2 leading-relaxed">
            No provider is contacted anywhere in this phase. Pick a state to see how it reads.
          </p>
          {order.map((id) => (
            <button
              key={id}
              type="button"
              role="menuitemradio"
              aria-checked={id === scenario}
              onClick={() => {
                setScenario(id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] transition-colors",
                id === scenario
                  ? "bg-blue-500/[0.08] text-[color:var(--tp-ink-0)]"
                  : "text-[color:var(--tp-ink-1)] hover:bg-[color:var(--tp-surface-2)]"
              )}
            >
              <Check className={cn("h-3.5 w-3.5 shrink-0", id === scenario ? "opacity-100" : "opacity-0")} />
              {scenarioLabels[id]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
