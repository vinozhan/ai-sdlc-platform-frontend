import { useEffect, useRef, type ReactNode } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock,
  Bug,
  Loader2,
  Minus,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Badge, Card, CardContent, CardHeader, CardTitle, Progress } from "@/components/ui/primitives";
import type { ConsoleLine, FindingStatus, ProofState, Severity } from "@/data/testingData";
import type { ViewFailure } from "@/components/testing/view";

/* ---------------------------------------------------------------- surfaces */

/** The app's Card, with the header slots this page needs. */
export function Panel({
  icon,
  label,
  title,
  meta,
  action,
  children,
  className,
  bodyClassName,
}: {
  icon?: ReactNode;
  label?: string;
  title?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={className}>
      {(label || title || action) && (
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0 flex-1">
              {label && (
                <CardTitle className="flex items-center gap-2">
                  {icon}
                  {label}
                </CardTitle>
              )}
              {title && <p className="mt-1 text-xs text-[color:var(--tp-ink-2)]">{title}</p>}
              {meta && <p className="tp-den mt-1">{meta}</p>}
            </div>
            {action}
          </div>
        </CardHeader>
      )}
      <CardContent className={bodyClassName}>{children}</CardContent>
    </Card>
  );
}

export function Hairline({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-[color:var(--tp-line)]", className)} />;
}

/* ------------------------------------------------------------------- chips */

type Tone = "neutral" | "pass" | "fail" | "caution" | "info";

const toneVariant: Record<Tone, "default" | "success" | "error" | "warning" | "info"> = {
  neutral: "default",
  pass: "success",
  fail: "error",
  caution: "warning",
  info: "info",
};

export function Chip({
  tone = "neutral",
  icon,
  children,
  className,
  title,
}: {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <Badge variant={toneVariant[tone]} className={className} title={title}>
      {icon}
      {children}
    </Badge>
  );
}

const severityIcon: Record<Severity, typeof ShieldAlert> = {
  critical: ShieldAlert,
  high: AlertTriangle,
  medium: AlertCircle,
  low: Minus,
};

/** red → orange → amber → slate, using the Badge variants the app already has. */
const severityVariant: Record<Severity, "error" | "c4" | "warning" | "default"> = {
  critical: "error",
  high: "c4",
  medium: "warning",
  low: "default",
};

export const severityVar: Record<Severity, string> = {
  critical: "var(--tp-crit)",
  high: "var(--tp-high)",
  medium: "var(--tp-med)",
  low: "var(--tp-low)",
};

export const severityLabel: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function SeverityChip({ severity }: { severity: Severity }) {
  const Icon = severityIcon[severity];
  return (
    <Badge variant={severityVariant[severity]}>
      <Icon className="h-3 w-3" />
      {severityLabel[severity]}
    </Badge>
  );
}

export const findingStatusLabel: Record<FindingStatus, string> = {
  open: "Open",
  "fix-proposed": "Fix proposed",
  "re-verifying": "Re-verifying",
  verified: "Fixed and re-verified",
  dismissed: "Dismissed",
};

export function FindingStatusChip({ status }: { status: FindingStatus }) {
  if (status === "verified")
    return (
      <Badge variant="success">
        <CheckCircle2 className="h-3 w-3" />
        Fixed and re-verified
      </Badge>
    );
  if (status === "re-verifying")
    return (
      <Badge variant="warning">
        <Loader2 className="tp-spin h-3 w-3" />
        Re-verifying
      </Badge>
    );
  if (status === "fix-proposed")
    return (
      <Badge variant="default">
        <Wrench className="h-3 w-3" />
        Fix proposed
      </Badge>
    );
  if (status === "dismissed")
    return (
      <Badge variant="default">
        <X className="h-3 w-3" />
        Dismissed
      </Badge>
    );
  return (
    <Badge variant="default">
      <CircleDot className="h-3 w-3" />
      Open
    </Badge>
  );
}

export function TriageChip({ failure }: { failure: ViewFailure }) {
  if (failure.awaitingRerun)
    return (
      <Badge variant="info" title="Counted as passing from the guard run. The next full run records it.">
        <Check className="h-3 w-3" />
        Approved · awaiting re-run
      </Badge>
    );
  if (failure.triage === "healed" || failure.state === "healed")
    return (
      <Badge variant="success">
        <Check className="h-3 w-3" />
        Healed
      </Badge>
    );
  if (failure.triage === "regression")
    return (
      <Badge variant="error">
        <Bug className="h-3 w-3" />
        Real regression
      </Badge>
    );
  return (
    <Badge variant="warning">
      <Wrench className="h-3 w-3" />
      Brittle test
    </Badge>
  );
}

export function StateChip({ failure }: { failure: ViewFailure }) {
  if (failure.state === "awaiting-approval")
    return (
      <Badge variant="info">
        <Clock className="h-3 w-3" />
        Awaiting you
      </Badge>
    );
  if (failure.state === "blocked")
    return (
      <Badge variant="error">
        <ShieldAlert className="h-3 w-3" />
        Guard rejected the repair
      </Badge>
    );
  if (failure.state === "escalated")
    return (
      <Badge variant="default">
        <Circle className="h-3 w-3" />
        With {failure.owner ?? "the developer"}
      </Badge>
    );
  return null;
}

export function ProofChip({ state }: { state: ProofState }) {
  if (state === "errored")
    return (
      <Badge variant="warning">
        <AlertTriangle className="h-3 w-3" />
        Could not run
      </Badge>
    );
  if (state === "pass")
    return (
      <Badge variant="success">
        <Check className="h-3 w-3" />
        Passed
      </Badge>
    );
  if (state === "fail")
    return (
      <Badge variant="error">
        <X className="h-3 w-3" />
        Failed
      </Badge>
    );
  if (state === "running")
    return (
      <Badge variant="warning">
        <Loader2 className="tp-spin h-3 w-3" />
        Running
      </Badge>
    );
  return (
    <Badge variant="default">
      <Clock className="h-3 w-3" />
      Queued
    </Badge>
  );
}

export function ActorMark({ actor, kind }: { actor: string; kind: "human" | "agent" | "guard" }) {
  if (kind === "human") {
    const initials = actor
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-[8px] font-bold text-white">
          {initials}
        </span>
        {actor}
      </span>
    );
  }
  const Icon = kind === "guard" ? ShieldCheck : Bot;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-blue-400" />
      {actor}
    </span>
  );
}

/* ----------------------------------------------------------------- numbers */

export function Metric({
  label,
  value,
  denominator,
  note,
  tone,
  size = "md",
}: {
  label: string;
  value: ReactNode;
  denominator?: ReactNode;
  note?: ReactNode;
  tone?: "pass" | "fail" | "caution" | "muted";
  size?: "sm" | "md" | "lg";
}) {
  const color =
    tone === "pass"
      ? "var(--tp-pass)"
      : tone === "fail"
      ? "var(--tp-fail)"
      : tone === "caution"
      ? "var(--tp-caution)"
      : tone === "muted"
      ? "var(--tp-muted)"
      : undefined;

  return (
    <div className="min-w-0">
      <p className="tp-label">{label}</p>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span
          className={cn("tp-num", size === "lg" ? "text-3xl" : size === "sm" ? "text-xl" : "text-2xl")}
          style={color ? { color } : undefined}
        >
          {value}
        </span>
        {denominator && <span className="tp-den">{denominator}</span>}
      </p>
      {note && <p className="tp-den mt-1 leading-relaxed">{note}</p>}
    </div>
  );
}

const barColor: Record<string, string> = {
  ink: "#2563eb",
  pass: "#10b981",
  caution: "#f59e0b",
  fail: "#ef4444",
  muted: "#94a3b8",
};

export function Bar({
  value,
  tone = "ink",
  className,
}: {
  value: number;
  tone?: "ink" | "pass" | "caution" | "fail" | "muted";
  className?: string;
}) {
  return <Progress value={value} color={barColor[tone]} className={className} />;
}

/* ----------------------------------------------------------------- console */

const consolePrefix: Record<ConsoleLine["kind"], { token: string; color: string; text: string }> = {
  cmd: { token: "$", color: "var(--tp-console-muted)", text: "var(--tp-console-ink)" },
  info: { token: "»", color: "var(--tp-console-muted)", text: "var(--tp-console-ink)" },
  pass: { token: "PASS", color: "var(--tp-console-pass)", text: "var(--tp-console-ink)" },
  fail: { token: "FAIL", color: "var(--tp-console-fail)", text: "var(--tp-console-ink)" },
  skip: { token: "SKIP", color: "var(--tp-console-caution)", text: "var(--tp-console-muted)" },
  detail: { token: "↳", color: "var(--tp-console-muted)", text: "var(--tp-console-fail)" },
  summary: { token: "", color: "var(--tp-console-muted)", text: "var(--tp-console-ink)" },
  muted: { token: "", color: "var(--tp-console-muted)", text: "var(--tp-console-muted)" },
};

export function Console({
  lines,
  streaming,
  label = "Run transcript",
  meta,
  className,
  action,
}: {
  lines: ConsoleLine[];
  streaming?: boolean;
  label?: string;
  meta?: string;
  className?: string;
  action?: ReactNode;
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!streaming) return;
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines.length, streaming]);

  return (
    <div className={cn("tp-console flex min-h-0 flex-col overflow-hidden rounded-xl", className)}>
      <div className="flex items-center gap-2 border-b border-[color:var(--tp-console-line)] px-3 py-2">
        <span className="tp-console-label">{label}</span>
        {meta && (
          <span className="tp-mono truncate text-[11px]" style={{ color: "var(--tp-console-muted)" }}>
            {meta}
          </span>
        )}
        <span className="ml-auto">{action}</span>
      </div>
      <div ref={bodyRef} className="min-h-0 flex-1 overflow-auto px-3 py-2.5">
        {lines.map((line, i) => {
          const style = consolePrefix[line.kind];
          return (
            <div
              key={`${i}-${line.text}`}
              className={cn(
                "flex gap-2 py-[1px] font-mono text-[11.5px] leading-[1.6]",
                streaming && i === lines.length - 1 && "tp-stream",
                line.kind === "summary" && "mt-2 border-t border-[color:var(--tp-console-line)] pt-2 font-medium"
              )}
            >
              <span className="w-[4ch] shrink-0 text-right" style={{ color: style.color }}>
                {style.token}
              </span>
              <span className="min-w-0 break-words" style={{ color: style.text }}>
                {line.text}
              </span>
            </div>
          );
        })}
        {streaming && (
          <div className="flex gap-2 font-mono text-[11.5px] leading-[1.6]">
            <span className="w-[4ch] shrink-0" />
            <span className="tp-caret" style={{ color: "var(--tp-console-ink)" }}>
              ▍
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- small text */

export function Note({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("tp-prose", className)}>{children}</p>;
}
