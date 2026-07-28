import { type ReactNode, useState } from "react";
import {
  User,
  GitBranch,
  Cloud,
  Brain,
  CheckCircle2,
  Link2,
  Unlink,
  Save,
  Shield,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/utils/cn";
import { Badge, Button } from "@/components/ui/primitives";
import { ProfilePhotoEditor } from "@/components/brand/UserAvatar";

type SettingsTab = "profile" | "git" | "vercel" | "ai";

const tabs: { id: SettingsTab; label: string; description: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", description: "Your identity & workspace", icon: User },
  { id: "git", label: "Git", description: "Source control provider", icon: GitBranch },
  { id: "vercel", label: "Vercel", description: "Deploy & preview URLs", icon: Cloud },
  { id: "ai", label: "AI Model", description: "Generation preferences", icon: Brain },
];

function SettingsPanel({
  icon: Icon,
  title,
  description,
  connected,
  children,
  footer,
}: {
  icon: typeof User;
  title: string;
  description: string;
  connected?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { theme } = useStore();
  const isDark = theme === "dark";

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border backdrop-blur-sm",
        isDark ? "border-white/[0.08] bg-[#0f1d32]/60" : "border-slate-200/80 bg-white/90 shadow-sm shadow-slate-200/50"
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-start justify-between gap-4 border-b px-6 py-5",
          isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-100 bg-slate-50/50"
        )}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className={cn("text-base font-semibold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
              {title}
            </h3>
            <p className={cn("mt-0.5 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>{description}</p>
          </div>
        </div>
        {connected !== undefined && (
          <Badge variant={connected ? "success" : "default"} className="px-2.5 py-1 text-xs">
            {connected ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Connected
              </>
            ) : (
              "Not connected"
            )}
          </Badge>
        )}
      </div>

      <div className="space-y-6 px-6 py-6">{children}</div>

      {footer && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-3 border-t px-6 py-4",
            isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-100 bg-slate-50/30"
          )}
        >
          {footer}
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  const { theme } = useStore();
  const isDark = theme === "dark";

  return (
    <div className={className}>
      <label className={cn("mb-1.5 block text-sm font-medium", isDark ? "text-slate-200" : "text-slate-700")}>
        {label}
      </label>
      {children}
      {hint && <p className={cn("mt-1.5 text-xs", isDark ? "text-slate-500" : "text-slate-400")}>{hint}</p>}
    </div>
  );
}

export function SettingsPage() {
  const {
    theme,
    settings,
    updateProfile,
    updateGitSettings,
    updateVercelSettings,
    updateAiSettings,
    addToast,
  } = useStore();
  const isDark = theme === "dark";
  const [tab, setTab] = useState<SettingsTab>("profile");

  const fieldClass = cn(
    "h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition-all",
    "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20",
    isDark
      ? "border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
  );

  return (
    <div className="w-full px-4 py-8 md:px-8 md:py-10 lg:px-10">
      <header className="mb-8">
        <h1 className={cn("text-3xl font-semibold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
          Settings
        </h1>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        {/* Side navigation */}
        <nav
          className={cn(
            "flex shrink-0 flex-row gap-1 overflow-x-auto rounded-2xl border p-1.5 lg:w-64 lg:flex-col",
            isDark ? "border-white/[0.08] bg-white/[0.03]" : "border-slate-200/80 bg-white/80 shadow-sm"
          )}
        >
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex min-w-[7.5rem] flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all sm:min-w-[140px] sm:gap-3 sm:px-3.5 sm:py-3 lg:min-w-0 lg:flex-none",
                  active
                    ? isDark
                      ? "bg-blue-600/20 text-white ring-1 ring-blue-500/30"
                      : "bg-blue-50 text-blue-900 ring-1 ring-blue-200"
                    : isDark
                    ? "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active && (isDark ? "text-blue-400" : "text-blue-600"))} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p
                    className={cn(
                      "hidden truncate text-[11px] lg:block",
                      active
                        ? isDark
                          ? "text-slate-400"
                          : "text-blue-600/70"
                        : isDark
                        ? "text-slate-600"
                        : "text-slate-400"
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {tab === "profile" && (
            <SettingsPanel
              icon={User}
              title="Profile"
              description="Manage how you appear across the platform"
              footer={
                <Button variant="primary" onClick={() => addToast({ type: "success", title: "Profile saved" })}>
                  <Save className="h-4 w-4" />
                  Save changes
                </Button>
              }
            >
              <ProfilePhotoEditor isDark={isDark} />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name">
                  <input
                    className={fieldClass}
                    value={settings.profile.name}
                    onChange={(e) => updateProfile({ name: e.target.value })}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    className={fieldClass}
                    value={settings.profile.email}
                    onChange={(e) => updateProfile({ email: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Workspace name" hint="Shown in the sidebar and shared project views">
                <input
                  className={fieldClass}
                  value={settings.profile.workspace}
                  onChange={(e) => updateProfile({ workspace: e.target.value })}
                />
              </Field>
            </SettingsPanel>
          )}

          {tab === "git" && (
            <SettingsPanel
              icon={GitBranch}
              title="Git integration"
              description="Connect repositories for code generation and traceability"
              connected={settings.git.connected}
              footer={
                <>
                  <Button
                    variant="primary"
                    onClick={() => {
                      updateGitSettings({ connected: true });
                      addToast({ type: "success", title: "Git connected", message: settings.git.provider });
                    }}
                  >
                    <Link2 className="h-4 w-4" />
                    Connect
                  </Button>
                  {settings.git.connected && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateGitSettings({ connected: false });
                        addToast({ type: "info", title: "Git disconnected" });
                      }}
                    >
                      <Unlink className="h-4 w-4" />
                      Disconnect
                    </Button>
                  )}
                </>
              }
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Provider">
                  <select
                    className={fieldClass}
                    value={settings.git.provider}
                    onChange={(e) => updateGitSettings({ provider: e.target.value })}
                  >
                    <option value="github">GitHub</option>
                    <option value="gitlab">GitLab</option>
                    <option value="bitbucket">Bitbucket</option>
                  </select>
                </Field>
                <Field label="Default organization" hint="Used when creating new repositories">
                  <input
                    className={fieldClass}
                    placeholder="your-org"
                    value={settings.git.defaultOrg}
                    onChange={(e) => updateGitSettings({ defaultOrg: e.target.value })}
                  />
                </Field>
              </div>
              <Field
                label="Personal access token"
                hint="Stored locally. Required scopes: repo, read:org"
              >
                <div className="relative">
                  <Shield className={cn("absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2", isDark ? "text-slate-500" : "text-slate-400")} />
                  <input
                    type="password"
                    className={cn(fieldClass, "pl-10 font-mono text-[13px]")}
                    placeholder="ghp_••••••••••••"
                    value={settings.git.token}
                    onChange={(e) => updateGitSettings({ token: e.target.value })}
                  />
                </div>
              </Field>
            </SettingsPanel>
          )}

          {tab === "vercel" && (
            <SettingsPanel
              icon={Cloud}
              title="Vercel deployment"
              description="Publish previews and production builds automatically"
              connected={settings.vercel.connected}
              footer={
                <>
                  <Button
                    variant="primary"
                    onClick={() => {
                      updateVercelSettings({ connected: true });
                      addToast({ type: "success", title: "Vercel connected" });
                    }}
                  >
                    <Link2 className="h-4 w-4" />
                    Connect Vercel
                  </Button>
                  {settings.vercel.connected && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateVercelSettings({ connected: false });
                        addToast({ type: "info", title: "Vercel disconnected" });
                      }}
                    >
                      <Unlink className="h-4 w-4" />
                      Disconnect
                    </Button>
                  )}
                </>
              }
            >
              <Field
                label="API token"
                hint="Create a token at vercel.com/account/tokens with full project access"
              >
                <div className="relative">
                  <Shield className={cn("absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2", isDark ? "text-slate-500" : "text-slate-400")} />
                  <input
                    type="password"
                    className={cn(fieldClass, "pl-10 font-mono text-[13px]")}
                    placeholder="vercel_••••••••"
                    value={settings.vercel.token}
                    onChange={(e) => updateVercelSettings({ token: e.target.value })}
                  />
                </div>
              </Field>
              <Field label="Team / scope" hint="Leave blank for personal account">
                <input
                  className={fieldClass}
                  placeholder="your-team"
                  value={settings.vercel.team}
                  onChange={(e) => updateVercelSettings({ team: e.target.value })}
                />
              </Field>
            </SettingsPanel>
          )}

          {tab === "ai" && (
            <SettingsPanel
              icon={Brain}
              title="AI model"
              description="Configure the model used across the SDLC pipeline"
              footer={
                <Button
                  variant="primary"
                  onClick={() =>
                    addToast({
                      type: "success",
                      title: "AI settings saved",
                      message: `${settings.ai.provider} · ${settings.ai.model}`,
                    })
                  }
                >
                  <Save className="h-4 w-4" />
                  Save AI settings
                </Button>
              }
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Provider">
                  <select
                    className={fieldClass}
                    value={settings.ai.provider}
                    onChange={(e) => updateAiSettings({ provider: e.target.value })}
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="azure">Azure OpenAI</option>
                    <option value="local">Local model</option>
                  </select>
                </Field>
                <Field label="Model">
                  <select
                    className={fieldClass}
                    value={settings.ai.model}
                    onChange={(e) => updateAiSettings({ model: e.target.value })}
                  >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4.1">GPT-4.1</option>
                    <option value="claude-4-sonnet">Claude 4 Sonnet</option>
                    <option value="claude-4-opus">Claude 4 Opus</option>
                  </select>
                </Field>
              </div>

              <Field label="API key" hint="Your key is never sent to our servers in this demo">
                <div className="relative">
                  <Shield className={cn("absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2", isDark ? "text-slate-500" : "text-slate-400")} />
                  <input
                    type="password"
                    className={cn(fieldClass, "pl-10 font-mono text-[13px]")}
                    placeholder="sk-••••••••••••"
                    value={settings.ai.apiKey}
                    onChange={(e) => updateAiSettings({ apiKey: e.target.value })}
                  />
                </div>
              </Field>

              <Field label="Temperature" hint="Lower = more deterministic, higher = more creative">
                <div
                  className={cn(
                    "rounded-xl border px-4 py-4",
                    isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-50/50"
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Precise</span>
                    <span className={cn("rounded-lg px-2.5 py-1 text-sm font-semibold tabular-nums", isDark ? "bg-blue-600/20 text-blue-300" : "bg-blue-100 text-blue-700")}>
                      {settings.ai.temperature.toFixed(1)}
                    </span>
                    <span className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Creative</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={settings.ai.temperature}
                    onChange={(e) => updateAiSettings({ temperature: Number(e.target.value) })}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full accent-blue-600"
                  />
                </div>
              </Field>
            </SettingsPanel>
          )}
        </div>
      </div>
    </div>
  );
}
