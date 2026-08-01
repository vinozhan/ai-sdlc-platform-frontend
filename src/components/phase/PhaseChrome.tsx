import { type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Card } from "@/components/ui/primitives";

/* ---------------------------------------------------------- summary strip */

/** One number the phase is judged on. A cell with an action links into the step that owns it. */
export type SummaryCell = {
  label: string;
  value: ReactNode;
  denominator?: ReactNode;
  note?: ReactNode;
  tone?: "pass" | "fail" | "caution" | "muted";
  onGoTo?: () => void;
  goToLabel?: string;
};

/**
 * The strip that stays visible above every step, so the phase's headline
 * numbers never depend on which step happens to be open.
 */
export function SummaryCells({ cells, className }: { cells: SummaryCell[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5", className)}>
      {cells.map((cell) => {
        const color =
          cell.tone === "pass"
            ? "var(--tp-pass)"
            : cell.tone === "fail"
            ? "var(--tp-fail)"
            : cell.tone === "caution"
            ? "var(--tp-caution)"
            : undefined;

        const body = (
          <>
            <p className="tp-label truncate">{cell.label}</p>
            <p className="mt-0.5 flex items-baseline gap-1.5">
              <span className="tp-num text-xl" style={color ? { color } : undefined}>
                {cell.value}
              </span>
              {cell.denominator && <span className="tp-den">{cell.denominator}</span>}
            </p>
            {cell.note && (
              <p className="tp-den mt-0.5 flex items-start gap-1 leading-snug">
                <span>{cell.note}</span>
                {cell.onGoTo && (
                  <ArrowRight className="mt-px h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </p>
            )}
          </>
        );

        return cell.onGoTo ? (
          <button
            key={cell.label}
            type="button"
            aria-label={cell.goToLabel}
            onClick={cell.onGoTo}
            className="group text-left"
          >
            <Card className="h-full px-3.5 py-2.5 hover:border-blue-500/40">{body}</Card>
          </button>
        ) : (
          <Card key={cell.label} className="px-3.5 py-2.5">
            {body}
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------- sticky header */

export function StickyHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "z-[11] -mx-6 space-y-3 bg-white px-6 pb-3 dark:bg-[#071018] md:-mx-8 md:px-8 lg:sticky",
        className
      )}
      style={{ top: "var(--tp-nav)" }}
    >
      {children}
    </div>
  );
}
