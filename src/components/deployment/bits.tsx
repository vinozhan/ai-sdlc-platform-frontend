import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Circle,
  Cloud,
  Database,
  GitBranch,
  Leaf,
  Loader2,
  RotateCcw,
  Server,
  X,
} from "lucide-react";
import { Chip } from "@/components/phase/bits";
import type {
  BindingStatus,
  DeployStepState,
  DeploymentStatus,
  MetricSource,
  ProofOutcome,
  ProviderId,
} from "@/types/platform";

export const providerIcon: Record<ProviderId, typeof GitBranch> = {
  github: GitBranch,
  vercel: Cloud,
  render: Server,
  neon: Database,
  atlas: Leaf,
};

export const providerName: Record<ProviderId, string> = {
  github: "GitHub",
  vercel: "Vercel",
  render: "Render",
  neon: "Neon Postgres",
  atlas: "MongoDB Atlas",
};

export function BindingStatusChip({ status }: { status: BindingStatus }) {
  if (status === "bound")
    return (
      <Chip tone="pass" icon={<CheckCircle2 className="h-3 w-3" />}>
        Bound
      </Chip>
    );
  if (status === "provisioning")
    return (
      <Chip tone="caution" icon={<Loader2 className="tp-spin h-3 w-3" />}>
        Being created
      </Chip>
    );
  if (status === "connection-missing")
    return (
      <Chip tone="fail" icon={<AlertTriangle className="h-3 w-3" />}>
        Connection missing
      </Chip>
    );
  return <Chip icon={<Circle className="h-3 w-3" />}>Not created yet</Chip>;
}

const deploymentStatusCopy: Record<DeploymentStatus, { label: string; tone: "pass" | "fail" | "caution" | "neutral" }> = {
  "not-started": { label: "Not started", tone: "neutral" },
  provisioning: { label: "Creating resources", tone: "caution" },
  building: { label: "Building", tone: "caution" },
  verifying: { label: "Running proofs", tone: "caution" },
  "awaiting-gate": { label: "Waiting on you", tone: "caution" },
  live: { label: "Live", tone: "pass" },
  failed: { label: "Failed", tone: "fail" },
  "rolled-back": { label: "Rolled back", tone: "neutral" },
};

export function DeploymentStatusChip({ status }: { status: DeploymentStatus }) {
  const { label, tone } = deploymentStatusCopy[status];
  const icon =
    tone === "pass" ? (
      <CheckCircle2 className="h-3 w-3" />
    ) : tone === "fail" ? (
      <X className="h-3 w-3" />
    ) : tone === "caution" ? (
      <Loader2 className="tp-spin h-3 w-3" />
    ) : status === "rolled-back" ? (
      <RotateCcw className="h-3 w-3" />
    ) : (
      <Circle className="h-3 w-3" />
    );
  return (
    <Chip tone={tone} icon={icon}>
      {label}
    </Chip>
  );
}

export function StepStateChip({ state }: { state: DeployStepState }) {
  if (state === "done")
    return (
      <Chip tone="pass" icon={<Check className="h-3 w-3" />}>
        Done
      </Chip>
    );
  if (state === "running")
    return (
      <Chip tone="caution" icon={<Loader2 className="tp-spin h-3 w-3" />}>
        Running
      </Chip>
    );
  if (state === "failed")
    return (
      <Chip tone="fail" icon={<X className="h-3 w-3" />}>
        Failed
      </Chip>
    );
  if (state === "compensating")
    return (
      <Chip tone="caution" icon={<RotateCcw className="tp-spin h-3 w-3" />}>
        Undoing
      </Chip>
    );
  if (state === "compensated")
    return (
      <Chip icon={<RotateCcw className="h-3 w-3" />}>Undone</Chip>
    );
  return <Chip icon={<Circle className="h-3 w-3" />}>Waiting</Chip>;
}

export function ProofChip({ state }: { state: ProofOutcome }) {
  if (state === "pass")
    return (
      <Chip tone="pass" icon={<Check className="h-3 w-3" />}>
        Passed
      </Chip>
    );
  if (state === "fail")
    return (
      <Chip tone="fail" icon={<X className="h-3 w-3" />}>
        Failed
      </Chip>
    );
  if (state === "running")
    return (
      <Chip tone="caution" icon={<Loader2 className="tp-spin h-3 w-3" />}>
        Running
      </Chip>
    );
  return <Chip icon={<Circle className="h-3 w-3" />}>Queued</Chip>;
}

/**
 * Every number on this page says where it came from. A tile without a source
 * and a window does not ship, so this mark is not decoration.
 */
export function SourceMark({ source, window: measuredOver, demo }: { source: MetricSource; window?: string; demo?: boolean }) {
  return (
    <p className="tp-den mt-1 leading-snug">
      {source}
      {measuredOver ? `, ${measuredOver}` : ""}
      {demo ? " · demo data" : ""}
    </p>
  );
}
