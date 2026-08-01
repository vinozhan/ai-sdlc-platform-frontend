import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Database,
  GitBranch,
  Leaf,
  Link2,
  Loader2,
  RefreshCw,
  Save,
  Server,
  ShieldCheck,
  Unlink,
  User,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/primitives";
import { Chip, Hairline, Note, Panel } from "@/components/phase/bits";
import {
  beginAuthorization,
  connectProvider,
  disconnectProvider,
  getConnections,
  rotateProvider,
  updateConnectionOptions,
} from "@/lib/orchestrator";
import { useScenario } from "@/lib/useScenario";
import { useStore } from "@/store/useStore";
import type { Connection, ConnectionOption, ProviderId } from "@/types/platform";

const providerIcon: Record<ProviderId, typeof GitBranch> = {
  github: GitBranch,
  vercel: Cloud,
  render: Server,
  neon: Database,
  atlas: Leaf,
};

/** Only one card can be mid flow, so the hub holds a single one. */
type Flow = {
  provider: ProviderId;
  step: "consent" | "authorizing" | "disconnect";
  intent: "connect" | "rotate";
  accountId: string;
};

export function ConnectionsHub() {
  const scenario = useScenario();
  const projects = useStore((s) => s.projects);
  const addToast = useStore((s) => s.addToast);

  const [connections, setConnections] = useState<Connection[] | null>(null);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [saving, setSaving] = useState<ProviderId | null>(null);

  useEffect(() => {
    let cancelled = false;
    setConnections(null);
    setFlow(null);
    getConnections().then((next) => {
      if (!cancelled) setConnections(next);
    });
    return () => {
      cancelled = true;
    };
  }, [scenario]);

  const patch = useCallback((next: Connection) => {
    setConnections((current) =>
      current ? current.map((c) => (c.provider === next.provider ? next : c)) : current
    );
  }, []);

  const startFlow = (connection: Connection, intent: "connect" | "rotate") =>
    setFlow({
      provider: connection.provider,
      step: "consent",
      intent,
      accountId:
        connection.availableAccounts.find((a) => a.label === connection.account)?.id ??
        connection.availableAccounts[0]?.id ??
        "",
    });

  /** Consent happens at the provider. Coming back is what creates the connection. */
  const authorize = async (connection: Connection) => {
    if (!flow) return;
    setFlow({ ...flow, step: "authorizing" });
    await beginAuthorization(connection.provider, flow.accountId);
    const next =
      flow.intent === "rotate"
        ? await rotateProvider(connection.provider, flow.accountId)
        : await connectProvider(connection.provider, flow.accountId);
    patch(next);
    setFlow(null);
    addToast({
      type: "success",
      title:
        flow.intent === "rotate"
          ? `${connection.name} credential replaced`
          : `${connection.name} connected`,
      message: `As ${next.account}. Bindings were kept.`,
    });
  };

  const disconnect = async (connection: Connection) => {
    setSaving(connection.provider);
    try {
      patch(await disconnectProvider(connection.provider));
      setFlow(null);
      addToast({
        type: "info",
        title: `${connection.name} disconnected`,
        message: "Nothing was deleted at the provider",
      });
    } finally {
      setSaving(null);
    }
  };

  const saveOptions = async (connection: Connection, options: ConnectionOption[]) => {
    setSaving(connection.provider);
    try {
      patch(await updateConnectionOptions(connection.provider, options));
      addToast({
        type: "success",
        title: `${connection.name} defaults saved`,
        message: "New resources use them from now on",
      });
    } finally {
      setSaving(null);
    }
  };

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? id;

  return (
    <div className="space-y-5">
      <Panel
        icon={<ShieldCheck className="h-4 w-4" />}
        label="How connections work"
        title="A connection is made once here and reused by every project."
      >
        <p className="tp-prose">
          Connecting sends you to the provider to approve the access, which is where the credential is
          created. The platform holds it from there and this browser never sees it, so there is no field to
          paste one into. What you set here is which account to build in and the defaults new resources
          start from.
        </p>
      </Panel>

      {connections === null && (
        <Panel label="Connections">
          <p className="tp-den flex items-center gap-2">
            <Loader2 className="tp-spin h-3.5 w-3.5" />
            Loading connections
          </p>
        </Panel>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {(connections ?? []).map((connection) => (
          <ConnectionCard
            key={connection.provider}
            connection={connection}
            flow={flow?.provider === connection.provider ? flow : null}
            saving={saving === connection.provider}
            affected={connection.usedByProjects.map(projectName)}
            onStartFlow={(intent) => startFlow(connection, intent)}
            onPickAccount={(accountId) => setFlow((f) => (f ? { ...f, accountId } : f))}
            onAuthorize={() => authorize(connection)}
            onAskDisconnect={() =>
              setFlow({ provider: connection.provider, step: "disconnect", intent: "connect", accountId: "" })
            }
            onDisconnect={() => disconnect(connection)}
            onCancel={() => setFlow(null)}
            onSaveOptions={(options) => saveOptions(connection, options)}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- card */

function ConnectionCard({
  connection,
  flow,
  saving,
  affected,
  onStartFlow,
  onPickAccount,
  onAuthorize,
  onAskDisconnect,
  onDisconnect,
  onCancel,
  onSaveOptions,
}: {
  connection: Connection;
  flow: Flow | null;
  saving: boolean;
  affected: string[];
  onStartFlow: (intent: "connect" | "rotate") => void;
  onPickAccount: (accountId: string) => void;
  onAuthorize: () => void;
  onAskDisconnect: () => void;
  onDisconnect: () => void;
  onCancel: () => void;
  onSaveOptions: (options: ConnectionOption[]) => void;
}) {
  const Icon = providerIcon[connection.provider];
  const connected = connection.status === "connected";

  return (
    <Panel
      icon={<Icon className="h-4 w-4" />}
      label={connection.name}
      title={connection.purpose}
      action={<StatusChip status={connection.status} />}
      className="flex flex-col"
      bodyClassName="flex flex-1 flex-col gap-4"
    >
      {connection.status === "expired" && connection.expiredNote && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-3 py-2 text-[12.5px] leading-relaxed text-[color:var(--tp-ink-1)]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
          {connection.expiredNote}
        </p>
      )}

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt className="tp-label">Account</dt>
          <dd className="tp-mono mt-1 truncate text-[12.5px] text-[color:var(--tp-ink-1)]">
            {connection.account ?? "None yet"}
          </dd>
        </div>
        <div>
          <dt className="tp-label">Last used</dt>
          <dd className="tp-mono mt-1 text-[12.5px] text-[color:var(--tp-ink-1)]">
            {connection.lastUsed ?? "Never"}
          </dd>
        </div>
      </dl>

      <div>
        <p className="tp-label">What it is allowed to do</p>
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {connection.scopes.map((scope) => (
            <li key={scope}>
              <Chip>{scope}</Chip>
            </li>
          ))}
        </ul>
      </div>

      {connected && <ConnectionDefaults connection={connection} saving={saving} onSave={onSaveOptions} />}

      <p className="tp-den">
        {affected.length === 0 ? "No project uses this connection yet" : `Used by ${affected.join(" and ")}`}
      </p>

      <div className="mt-auto">
        <Hairline className="mb-3" />

        {flow?.step === "consent" || flow?.step === "authorizing" ? (
          <ConsentStep
            connection={connection}
            flow={flow}
            onPickAccount={onPickAccount}
            onAuthorize={onAuthorize}
            onCancel={onCancel}
          />
        ) : flow?.step === "disconnect" ? (
          <div className="space-y-2.5">
            <p className="text-[12.5px] leading-relaxed text-[color:var(--tp-ink-1)]">
              {affected.length === 0
                ? `Disconnect ${connection.name}?`
                : `Disconnecting ${connection.name} stops deploys for ${affected.join(
                    " and "
                  )}. Their bindings are kept, so reconnecting the same account picks them up again.`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="error" disabled={saving} onClick={onDisconnect}>
                {saving ? <Loader2 className="tp-spin h-3.5 w-3.5" /> : <Unlink className="h-3.5 w-3.5" />}
                Disconnect {connection.name}
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}>
                Keep it
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {!connected && (
              <Button size="sm" variant="primary" onClick={() => onStartFlow("connect")}>
                <Link2 className="h-3.5 w-3.5" />
                {connection.status === "expired" ? "Reconnect" : `Connect ${connection.name}`}
              </Button>
            )}
            {connected && (
              <>
                <Button size="sm" variant="outline" onClick={() => onStartFlow("rotate")}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Replace credential
                </Button>
                <Button size="sm" variant="outline" onClick={onAskDisconnect}>
                  <Unlink className="h-3.5 w-3.5" />
                  Disconnect
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}

/* --------------------------------------------------------------- consent */

function ConsentStep({
  connection,
  flow,
  onPickAccount,
  onAuthorize,
  onCancel,
}: {
  connection: Connection;
  flow: Flow;
  onPickAccount: (accountId: string) => void;
  onAuthorize: () => void;
  onCancel: () => void;
}) {
  const working = flow.step === "authorizing";

  if (working) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-[color:var(--tp-line)] px-3.5 py-3">
        <Loader2 className="tp-spin mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[color:var(--tp-ink-0)]">
            Waiting for {connection.name}
          </p>
          <p className="tp-den mt-0.5 leading-relaxed">
            Approve the access in the window {connection.name} opened. The credential is created there and
            handed straight to the platform.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 rounded-xl border border-blue-500/30 bg-blue-500/[0.04] px-3.5 py-3">
      <div>
        <p className="text-[13px] font-medium text-[color:var(--tp-ink-0)]">
          {flow.intent === "rotate"
            ? `Replace the ${connection.name} credential`
            : `Connect ${connection.name}`}
        </p>
        <p className="tp-den mt-0.5 leading-relaxed">
          {flow.intent === "rotate"
            ? "The old credential stops working as soon as the new one is approved. Bindings are kept."
            : "Pick where the platform should build, then approve the access."}
        </p>
      </div>

      <fieldset>
        <legend className="tp-label">Build in</legend>
        <div className="mt-1.5 space-y-1.5">
          {connection.availableAccounts.map((account) => {
            const AccountIcon = account.kind === "organisation" ? Building2 : User;
            const picked = account.id === flow.accountId;
            return (
              <label
                key={account.id}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 transition-colors",
                  picked
                    ? "border-blue-500/50 bg-blue-500/[0.07]"
                    : "border-[color:var(--tp-line)] hover:border-blue-500/30"
                )}
              >
                <input
                  type="radio"
                  name={`account-${connection.provider}`}
                  value={account.id}
                  checked={picked}
                  onChange={() => onPickAccount(account.id)}
                  className="mt-1 h-3.5 w-3.5 shrink-0 accent-blue-600"
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <AccountIcon className="h-3.5 w-3.5 text-[color:var(--tp-muted)]" />
                    <span className="tp-mono text-[12.5px] text-[color:var(--tp-ink-0)]">{account.label}</span>
                    <Chip>{account.kind === "organisation" ? "Organisation" : "Personal"}</Chip>
                  </span>
                  {account.note && <span className="tp-den mt-0.5 block">{account.note}</span>}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-3">
        <div>
          <p className="tp-label">It will be able to</p>
          <ul className="mt-1.5 space-y-1">
            {connection.scopes.map((scope) => (
              <li key={scope} className="flex items-start gap-1.5 text-[12px] leading-relaxed text-[color:var(--tp-ink-1)]">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--tp-pass)]" />
                {scope}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="tp-label">It will not be able to</p>
          <ul className="mt-1.5 space-y-1">
            {connection.limits.map((limit) => (
              <li key={limit} className="flex items-start gap-1.5 text-[12px] leading-relaxed text-[color:var(--tp-ink-1)]">
                <Ban className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--tp-muted)]" />
                {limit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="primary" disabled={!flow.accountId} onClick={onAuthorize}>
          Continue to {connection.name}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- defaults */

function ConnectionDefaults({
  connection,
  saving,
  onSave,
}: {
  connection: Connection;
  saving: boolean;
  onSave: (options: ConnectionOption[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ConnectionOption[]>(connection.options);

  useEffect(() => setDraft(connection.options), [connection.options]);

  const dirty = useMemo(
    () => draft.some((o, i) => o.value !== connection.options[i]?.value),
    [draft, connection.options]
  );

  const set = (key: string, value: string) =>
    setDraft((current) => current.map((o) => (o.key === key ? { ...o, value } : o)));

  const fieldClass =
    "mt-1 w-full rounded-lg border border-[color:var(--tp-line)] bg-transparent px-2.5 py-1.5 text-[12.5px] text-[color:var(--tp-ink-0)] outline-none focus:border-blue-500/50";

  return (
    <div className="rounded-xl border border-[color:var(--tp-line)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left"
      >
        <span className="min-w-0">
          <span className="block text-[13px] font-medium text-[color:var(--tp-ink-0)]">
            Defaults for new resources
          </span>
          <span className="tp-den mt-0.5 block truncate">
            {connection.options.map((o) => o.value).join(" · ")}
          </span>
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-[color:var(--tp-muted)] transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-[color:var(--tp-line)] px-3.5 py-3">
          {draft.map((option) => (
            <div key={option.key}>
              <label className="tp-label block" htmlFor={`${connection.provider}-${option.key}`}>
                {option.label}
              </label>
              {option.choices ? (
                <select
                  id={`${connection.provider}-${option.key}`}
                  value={option.value}
                  onChange={(e) => set(option.key, e.target.value)}
                  className={fieldClass}
                >
                  {option.choices.map((choice) => (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`${connection.provider}-${option.key}`}
                  value={option.value}
                  spellCheck={false}
                  onChange={(e) => set(option.key, e.target.value)}
                  className={cn(fieldClass, "tp-mono")}
                />
              )}
              <p className="tp-den mt-1 leading-relaxed">{option.help}</p>
            </div>
          ))}

          <Note>
            Changing a default does not move anything that already exists. It applies the next time this
            connection creates a resource.
          </Note>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="primary" disabled={!dirty || saving} onClick={() => onSave(draft)}>
              {saving ? <Loader2 className="tp-spin h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              Save defaults
            </Button>
            {dirty && (
              <Button size="sm" variant="outline" onClick={() => setDraft(connection.options)}>
                Undo changes
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusChip({ status }: { status: Connection["status"] }) {
  if (status === "connected")
    return (
      <Chip tone="pass" icon={<CheckCircle2 className="h-3 w-3" />}>
        Connected
      </Chip>
    );
  if (status === "expired")
    return (
      <Chip tone="caution" icon={<AlertTriangle className="h-3 w-3" />}>
        Expired
      </Chip>
    );
  return <Chip>Not connected</Chip>;
}
