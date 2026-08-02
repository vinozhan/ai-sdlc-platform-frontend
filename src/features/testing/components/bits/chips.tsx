import type { ReactNode } from "react";
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
import { Badge } from "@/shared/ui/primitives";
import type { FindingStatus, ProofState, Severity } from "../../fixtures/types";
import type { ViewFailure } from "../../model/view";

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
