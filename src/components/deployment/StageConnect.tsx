import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ExternalLink, Eye, EyeOff, Loader2, Plug, Save, Settings2, Variable } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { Hairline, Note, Panel } from "@/components/phase/bits";
import { BindingStatusChip, providerIcon, providerName } from "@/components/deployment/bits";
import { getBindings, getConnections, getEnvValues, updateEnvValue } from "@/lib/orchestrator";
import { useScenario } from "@/lib/useScenario";
import { useStore } from "@/store/useStore";
import type { Binding, Connection, EnvValue } from "@/types/platform";

const kindLabel: Record<Binding["kind"], string> = {
  repository: "Repository",
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
};

const kindOrder: Binding["kind"][] = ["repository", "frontend", "backend", "database"];

export function StageConnect({ projectId }: { projectId: string }) {
  const scenario = useScenario();
  const [bindings, setBindings] = useState<Binding[] | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [envValues, setEnvValues] = useState<EnvValue[]>([]);

  useEffect(() => {
    let cancelled = false;
    setBindings(null);
    Promise.all([getBindings(projectId), getConnections(), getEnvValues(projectId)]).then(
      ([b, c, e]) => {
        if (cancelled) return;
        setBindings(b);
        setConnections(c);
        setEnvValues(e);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [projectId, scenario]);

  // A connection this project holds no binding against is not this project's
  // problem, so it does not get a warning here.
  const usedProviders = new Set((bindings ?? []).map((b) => b.provider));
  const unhealthy = connections.filter((c) => c.status !== "connected" && usedProviders.has(c.provider));

  return (
    <div className="space-y-5">
      <Panel
        icon={<Plug className="h-4 w-4" />}
        label="What this project is wired to"
        title="Connections are made once for the workspace. Bindings belong to this project."
        action={
          <Link to="/settings">
            <Button size="sm" variant="outline">
              <Settings2 className="h-3.5 w-3.5" />
              Manage connections
            </Button>
          </Link>
        }
      >
        <Note>
          Each binding below was created by the phase that needed it, not by hand. Code Generation created
          the repository. Deployment creates the frontend, backend and database the first time this project
          ships. There is nothing to paste here: the credentials sit with the connection, and the binding
          only records which resource this project owns.
        </Note>

        {unhealthy.length > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            <p className="text-[12.5px] leading-relaxed text-[color:var(--tp-ink-1)]">
              {unhealthy.map((c) => c.name).join(" and ")}{" "}
              {unhealthy.length === 1 ? "is" : "are"} not usable right now, so any step that needs{" "}
              {unhealthy.length === 1 ? "it" : "them"} will stop before it calls the provider.{" "}
              <Link to="/settings" className="font-medium text-blue-500 hover:underline">
                Fix this in Settings
              </Link>
              .
            </p>
          </div>
        )}
      </Panel>

      <Panel label="Bindings" title={`${bindings?.length ?? 0} resources this project owns`}>
        {bindings === null ? (
          <p className="tp-den flex items-center gap-2">
            <Loader2 className="tp-spin h-3.5 w-3.5" />
            Loading bindings
          </p>
        ) : (
          <ul className="space-y-2.5">
            {kindOrder.map((kind) => {
              const binding = bindings.find((b) => b.kind === kind);
              const connection = binding ? connections.find((c) => c.provider === binding.provider) : undefined;
              const Icon = binding ? providerIcon[binding.provider] : Variable;

              if (!binding) {
                return (
                  <li
                    key={kind}
                    className="rounded-xl border border-dashed border-[color:var(--tp-line)] px-3.5 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-medium text-[color:var(--tp-ink-2)]">{kindLabel[kind]}</p>
                      <BindingStatusChip status="not-created" />
                    </div>
                    <p className="tp-den mt-1">
                      Deployment creates this the first time the project ships to preview.
                    </p>
                  </li>
                );
              }

              const blocked = connection && connection.status !== "connected";

              return (
                <li key={kind} className="rounded-xl border border-[color:var(--tp-line)] px-3.5 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--tp-ink-2)]" />
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-[13px] font-medium text-[color:var(--tp-ink-0)]">
                            {kindLabel[binding.kind]}
                          </span>
                          <span className="tp-den">on {providerName[binding.provider]}</span>
                        </p>
                        <p className="tp-mono mt-0.5 truncate text-[12.5px] text-[color:var(--tp-ink-1)]">
                          {binding.resourceName}
                        </p>
                        <p className="tp-den mt-1 leading-relaxed">{binding.detail}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <BindingStatusChip status={blocked ? "connection-missing" : binding.status} />
                      {binding.url && (
                        <a
                          href={binding.url}
                          target="_blank"
                          rel="noreferrer"
                          className="tp-den inline-flex items-center gap-1 hover:text-blue-500"
                        >
                          Open
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <Hairline className="my-2.5" />
                  <p className="tp-den">
                    Created by {binding.bornIn}
                    {blocked && connection ? ` · waiting on the ${connection.name} connection` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <EnvironmentValues projectId={projectId} values={envValues} onChange={setEnvValues} />
    </div>
  );
}

/* ------------------------------------------------------ environment values */

function EnvironmentValues({
  projectId,
  values,
  onChange,
}: {
  projectId: string;
  values: EnvValue[];
  onChange: (next: EnvValue[]) => void;
}) {
  const addToast = useStore((s) => s.addToast);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const toggleReveal = (name: string) =>
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const save = async (value: EnvValue) => {
    setSaving(true);
    try {
      const result = await updateEnvValue(projectId, value.name);
      onChange(values.map((v) => (v.name === value.name ? { ...v, setBy: "you" } : v)));
      setEditing(null);
      setDraft("");
      addToast({
        type: "success",
        title: `${result.name} replaced`,
        message: "It takes effect on the next deploy",
      });
    } finally {
      setSaving(false);
    }
  };

  const show = (value: EnvValue, raw: string | null) => {
    if (raw === null) return "Not set";
    if (!value.secret || revealed.has(value.name)) return raw;
    return "•".repeat(Math.min(raw.length, 24));
  };

  if (values.length === 0) {
    return (
      <Panel icon={<Variable className="h-4 w-4" />} label="Environment values">
        <Note>
          Nothing is set yet. Deployment writes the wiring values the first time this project ships, and
          anything the application needs on top of that is added here.
        </Note>
      </Panel>
    );
  }

  return (
    <Panel
      icon={<Variable className="h-4 w-4" />}
      label="Environment values"
      title="What the running application reads, per environment"
      meta="Values written by Deployment are kept in step with the bindings, so editing them here would drift"
    >
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-[color:var(--tp-line)]">
              <th className="tp-label py-2 pr-4">Name</th>
              <th className="tp-label py-2 pr-4">Preview</th>
              <th className="tp-label py-2 pr-4">Production</th>
              <th className="tp-label py-2 pr-4">Set by</th>
              <th className="tp-label py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {values.map((value) => {
              const isEditing = editing === value.name;
              return (
                <tr key={value.name} className="border-b border-[color:var(--tp-line)] align-top last:border-0">
                  <td className="py-3 pr-4">
                    <p className="tp-mono text-[12.5px] text-[color:var(--tp-ink-0)]">{value.name}</p>
                    {value.pointsAt && <p className="tp-den mt-0.5">Points at {value.pointsAt}</p>}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="tp-mono break-all text-[12px] text-[color:var(--tp-ink-1)]">
                      {show(value, value.preview)}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="tp-mono break-all text-[12px] text-[color:var(--tp-ink-1)]">
                      {show(value, value.production)}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="tp-den">{value.setBy === "deployment" ? "Deployment" : "You"}</p>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1.5">
                      {value.secret && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={revealed.has(value.name) ? `Hide ${value.name}` : `Show ${value.name}`}
                          onClick={() => toggleReveal(value.name)}
                        >
                          {revealed.has(value.name) ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                      {value.setBy === "deployment" ? (
                        <span className="tp-den self-center">Managed</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(isEditing ? null : value.name);
                            setDraft("");
                          }}
                        >
                          {isEditing ? "Cancel" : "Replace"}
                        </Button>
                      )}
                    </div>

                    {isEditing && (
                      <div className="mt-2.5 w-full min-w-[16rem]">
                        <label className="tp-label block" htmlFor={`env-${value.name}`}>
                          New value for both environments
                        </label>
                        <input
                          id={`env-${value.name}`}
                          autoFocus
                          type={value.secret ? "password" : "text"}
                          autoComplete="off"
                          spellCheck={false}
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          className="tp-mono mt-1.5 w-full rounded-xl border border-[color:var(--tp-line)] bg-transparent px-3 py-2 text-[12.5px] outline-none focus:border-blue-500/50"
                        />
                        <p className="tp-den mt-1.5 leading-relaxed">
                          The value goes straight to the platform and is not kept by this screen.
                        </p>
                        <Button
                          size="sm"
                          variant="primary"
                          className="mt-2"
                          disabled={!draft.trim() || saving}
                          onClick={() => save(value)}
                        >
                          {saving ? <Loader2 className="tp-spin h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                          Save value
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
