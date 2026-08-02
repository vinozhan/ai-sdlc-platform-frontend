import { GitBranch, Server } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives";
import { connectedRepositories } from "../fixtures/repositories";
import type { ProviderId, ProviderState } from "../model/types";
import { StatusChip } from "./StatusChip";

type RepoPanelProps = {
  providers: ProviderState[];
  onConnectProvider: (providerId: ProviderId) => void | Promise<void>;
};

export function RepoPanel({ providers, onConnectProvider }: RepoPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-orange-400" />
            Connected repositories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {connectedRepositories.map((repo) => (
            <div key={repo.id} className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-900 dark:text-white">{repo.name}</span>
                <Badge variant="default">
                  <GitBranch className="h-3 w-3" />
                  {repo.branch}
                </Badge>
                <span className="text-xs text-slate-500">last commit {repo.commit}</span>
                <div className="ml-auto">
                  <StatusChip connected={repo.state === "connected"} />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1 text-xs">
                {repo.stack.map((tech) => (
                  <Badge key={tech} variant="default">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-4 w-4 text-orange-400" />
            Providers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {providers.map((provider) => (
            <div key={provider.id} className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{provider.label}</p>
                  <p className="text-xs text-slate-500">{provider.linkedName}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{provider.note}</p>
                </div>
                <StatusChip connected={provider.connected} />
              </div>
              {!provider.connected && (
                <Button size="sm" variant="outline" className="mt-2" onClick={() => void onConnectProvider(provider.id)}>
                  Connect
                </Button>
              )}
            </div>
          ))}

          <div className="rounded-xl border border-slate-800 p-3 dark:border-white/10">
            <p className="mb-2 text-xs font-semibold text-slate-400">Secrets</p>
            <div className="space-y-1 text-xs">
              {["VERCEL_TOKEN", "RENDER_DEPLOY_HOOK_URL", "DATABASE_URL"].map((secret) => (
                <div
                  key={secret}
                  className="flex items-center justify-between rounded bg-slate-900/60 px-2 py-1 dark:bg-slate-950"
                >
                  <span className="font-mono text-slate-300">{secret}</span>
                  <span className="font-mono text-slate-500">********</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
