import { useEffect, useState } from "react";
import { ExternalLink, Globe, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { Note, Panel } from "@/components/phase/bits";
import { ProofPair } from "@/components/phase/ProofPair";
import { getProofs } from "@/lib/orchestrator";
import { useScenario } from "@/lib/useScenario";
import type { Deployment, Proof } from "@/types/platform";

/** Both proofs green is the only state that arms the gate. Everything else explains itself. */
export function gateVerdict(proofs: Proof[]): { armed: boolean; text: string } {
  if (proofs.length === 0) return { armed: false, text: "Nothing has been deployed to preview yet, so there is nothing to check" };
  const failed = proofs.filter((p) => p.state === "fail");
  if (failed.length) return { armed: false, text: `${failed.map((p) => p.label).join(" and ")} failed, so this cannot go to production` };
  const running = proofs.filter((p) => p.state === "running" || p.state === "pending");
  if (running.length) return { armed: false, text: `Waiting on ${running.map((p) => p.label.toLowerCase()).join(" and ")}` };
  return { armed: true, text: "Both proofs passed on the preview URL, so this release can go to production" };
}

export function StageVerify({
  deployment,
  proofs,
  loading,
}: {
  deployment: Deployment | null;
  proofs: Proof[];
  loading: boolean;
}) {
  const verdict = gateVerdict(proofs);
  const health = proofs.find((p) => p.id === "health");
  const smoke = proofs.find((p) => p.id === "smoke");

  return (
    <div className="space-y-5">
      <Panel
        icon={<Globe className="h-4 w-4" />}
        label="Preview"
        title="Production is never the first place a change runs"
        action={
          deployment?.previewUrl && (
            <a href={deployment.previewUrl} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline">
                Open the preview
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          )
        }
      >
        {deployment?.previewUrl ? (
          <>
            <p className="tp-mono break-all text-[12.5px] text-[color:var(--tp-ink-1)]">
              {deployment.previewUrl}
            </p>
            <p className="tp-den mt-1.5">
              Commit {deployment.commit.sha} · {deployment.commit.message} · {deployment.commit.author}
            </p>
            <Note className="mt-3">
              The preview runs against its own database branch, so the smoke suite can write freely without
              touching production data.
            </Note>
          </>
        ) : (
          <Note>
            No preview URL yet. Deploy to preview in the previous step and the proofs run against it
            automatically.
          </Note>
        )}
      </Panel>

      <Panel
        icon={<ShieldCheck className="h-4 w-4" />}
        label="The two proofs"
        title="What has to be true before production is even offered"
        bodyClassName="p-0 sm:p-0"
      >
        {loading ? (
          <p className="tp-den flex items-center gap-2 p-4">
            <Loader2 className="tp-spin h-3.5 w-3.5" />
            Running the proofs
          </p>
        ) : (
          <ProofPair
            className="rounded-none border-0"
            label="Preview verification"
            meta={deployment ? deployment.id : undefined}
            left={{
              label: health?.label ?? "Health check",
              state: health?.state ?? "pending",
              detail: health?.detail ?? "Waiting for a preview deployment",
              at: health?.at ?? undefined,
            }}
            right={{
              label: smoke?.label ?? "Smoke tests",
              state: smoke?.state ?? "pending",
              detail: smoke?.detail ?? "Waiting for a preview deployment",
              at: smoke?.at ?? undefined,
            }}
            verdict={{ state: verdict.armed ? "pass" : proofs.some((p) => p.state === "fail") ? "fail" : "pending", text: verdict.text }}
            footer={
              <p className="tp-den leading-relaxed">
                Both proofs are measured by the platform probe against the preview URL. Promotion stays out
                of reach until each one has answered, and the decision at the bottom of this page is the only
                place it can be made.
              </p>
            }
          />
        )}
      </Panel>
    </div>
  );
}

/** Small helper so the page can keep proofs in one place and pass them down. */
export function useProofs(deploymentId: string | null) {
  const scenario = useScenario();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Nothing has been deployed, so there is nothing to have proved.
    if (!deploymentId) {
      setProofs([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getProofs(deploymentId).then((next) => {
      if (cancelled) return;
      setProofs(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [deploymentId, scenario]);

  return { proofs, loading };
}
