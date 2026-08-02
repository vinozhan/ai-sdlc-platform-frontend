import { ArrowUpRight, Bot, Cpu, ShieldCheck, X } from "lucide-react";
import { Badge, Button } from "@/shared/ui/primitives";
import { Note } from "../../bits/index";
import { CodeDiff } from "../../RepairProof";
import type { Finding } from "../../../fixtures/types";
import type { StepId } from "../../../model/view";

export function SecurityFindingDetail({
  finding,
  onApplyFix,
  onDismiss,
  onGoTo,
}: {
  finding: Finding;
  onApplyFix: (id: string) => void;
  onDismiss: (id: string) => void;
  onGoTo: (step: StepId) => void;
}) {
  const canApply = Boolean(finding.fix) && (finding.status === "open" || finding.status === "fix-proposed");

  return (
    <div className="space-y-3.5">
      <div>
        <p className="tp-label">What the problem is</p>
        <Note className="mt-1.5 max-w-3xl">{finding.explanation}</Note>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="tp-label mr-1">Found by</span>
        {finding.foundBy.includes("local") && (
          <Badge variant="default">
            <Cpu className="h-3 w-3" />
            Local model
          </Badge>
        )}
        {finding.foundBy.includes("reviewer") && (
          <Badge variant="default">
            <Bot className="h-3 w-3" />
            AI reviewer
          </Badge>
        )}
        {finding.foundBy.length === 2 && <span className="tp-den">both detectors agreed on this one</span>}
        <span className="ml-auto font-mono text-[11px] text-[color:var(--tp-ink-2)]">
          {finding.file}:{finding.line}
        </span>
      </div>

      {finding.fix ? (
        <div>
          <p className="tp-label">Proposed fix</p>
          <Note className="mb-2 mt-1.5">{finding.fix.summary}</Note>
          <CodeDiff
            before={finding.fix.before}
            after={finding.fix.after}
            language={finding.fix.language}
            beforeLabel="Code today"
            afterLabel="Proposed fix"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <Note className="text-[12.5px]">{finding.openReason}</Note>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-[color:var(--tp-line)] pt-3.5">
        {canApply && (
          <>
            <Button variant="primary" size="sm" onClick={() => onApplyFix(finding.id)}>
              <ShieldCheck className="h-3.5 w-3.5" />
              Apply fix
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDismiss(finding.id)}>
              <X className="h-3.5 w-3.5" />
              Dismiss
            </Button>
            <p className="tp-den ml-auto max-w-sm text-right">
              Applying starts two proofs: the scan runs again, and so does the whole suite.
            </p>
          </>
        )}
        {(finding.status === "re-verifying" || finding.status === "verified") && (
          <button
            type="button"
            onClick={() => onGoTo("reverify")}
            className="inline-flex items-center gap-1.5 text-[13px] text-blue-600 underline underline-offset-2 dark:text-blue-400"
          >
            {finding.status === "verified" ? "See both proofs" : "Watch the proofs run"}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}
        {finding.status === "dismissed" && <Note className="text-[12.5px]">Dismissed. It stays in the audit log.</Note>}
        {!finding.fix && finding.status === "open" && <Note className="text-[12.5px]">Nothing to apply yet.</Note>}
      </div>
    </div>
  );
}
