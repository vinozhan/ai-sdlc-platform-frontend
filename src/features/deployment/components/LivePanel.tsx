import { Activity, History, Package, TriangleAlert } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Table, Td, Th } from "@/shared/ui/primitives";
import type { DeploymentMetrics, DeploymentRecord, ReleaseRecord } from "../model/types";

type LivePanelProps = {
  deployments: DeploymentRecord[];
  metrics: DeploymentMetrics | null;
  releases: ReleaseRecord[];
  onRequestRollback: (version: string | null) => void;
};

export function LivePanel({
  deployments,
  metrics,
  releases,
  onRequestRollback,
}: LivePanelProps) {
  const degraded =
    metrics != null && Number.parseFloat(metrics.errorRate.value) > 0.25;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Environments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Preview - Vercel</p>
                <Badge variant="success">verified</Badge>
              </div>
              <p className="mt-1 font-mono text-xs text-slate-500">{deployments[0]?.previewUrl}</p>
            </div>
            <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Production - Vercel + Render</p>
                <Badge variant="success">live</Badge>
              </div>
              <p className="mt-1 font-mono text-xs text-slate-500">
                {deployments[0]?.productionUrl ?? "https://nexuspay.app"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Render backend is waking up when idle, first request can be slower.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Production metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                <p className="text-xs text-slate-500">Uptime</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{metrics?.uptime.value}</p>
                <p className="text-xs text-slate-500">{metrics?.uptime.window}</p>
              </div>
              <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                <p className="text-xs text-slate-500">p95 response</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {metrics?.p95.value}
                  {metrics?.p95.unit}
                </p>
                <p className="text-xs text-slate-500">{metrics?.p95.window}</p>
              </div>
              <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                <p className="text-xs text-slate-500">Error rate</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{metrics?.errorRate.value}</p>
                <p className="text-xs text-slate-500">5xx over total, {metrics?.errorRate.window}</p>
              </div>
              <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
                <p className="text-xs text-slate-500">Instances</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{metrics?.instances}</p>
                <p className="text-xs text-slate-500">window: last 5 minutes</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
              <p className="text-xs text-slate-500">Requests per minute sparkline</p>
              <div className="mt-2 flex items-end gap-1">
                {(metrics?.requestRateSparkline ?? []).map((v, i) => (
                  <div
                    key={`${v}-${i}`}
                    className="w-3 rounded bg-blue-500/40"
                    style={{ height: `${Math.max(10, v)}px` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-4 w-4 text-orange-400" />
            Release history and rollback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <Th>Version</Th>
                <Th>When</Th>
                <Th>Approved by</Th>
                <Th>Verified</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {releases.map((release) => (
                <tr key={release.version}>
                  <Td className="font-mono">{release.version}</Td>
                  <Td>{release.when}</Td>
                  <Td>{release.approvedBy}</Td>
                  <Td>
                    <Badge variant={release.verified ? "success" : "warning"}>
                      {release.verified ? "verified" : "pending"}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRequestRollback(release.version)}
                      disabled={!release.verified}
                    >
                      Roll back
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-400" />
              Dependency watch timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { date: "2026-07-29 12:05", pkg: "jackson-databind", action: "held", score: 70 },
              { date: "2026-07-28 16:22", pkg: "spring-boot-starter-web", action: "scheduled", score: 30 },
              { date: "2026-07-27 10:12", pkg: "tomcat-embed-core", action: "applied", score: 12 },
            ].map((item) => (
              <div
                key={`${item.pkg}-${item.date}`}
                className="flex items-center justify-between rounded-xl border border-slate-800 p-3 dark:border-white/10"
              >
                <div>
                  <p className="text-xs font-medium text-slate-900 dark:text-white">{item.pkg}</p>
                  <p className="text-[11px] text-slate-500">{item.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      item.action === "applied" ? "success" : item.action === "scheduled" ? "warning" : "error"
                    }
                  >
                    {item.action}
                  </Badge>
                  <Badge variant="default">{item.score}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-400" />
              AI parsed release notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {releases.map((release) => (
              <div
                key={`${release.version}-note`}
                className="rounded-xl border border-slate-800 p-3 dark:border-white/10"
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs text-slate-900 dark:text-white">{release.version}</p>
                  <p className="text-[11px] text-slate-500">{release.when}</p>
                </div>
                <p className="mt-1 text-xs text-slate-400">{release.notes}</p>
                <p className="mt-1 text-[11px] text-slate-500">Suggested requirement follow-up created.</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {degraded && (
        <Card className="border-amber-500/30">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-white">
              <TriangleAlert className="h-4 w-4 text-amber-400" />
              Degraded state detected. Suggest roll back to {releases[0]?.version}.
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRequestRollback(releases[0]?.version ?? null)}
            >
              Suggest rollback
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
