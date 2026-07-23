import { useState } from "react";
import {
  User,
  GitBranch,
  Cloud,
  Brain,
  CheckCircle2,
  Link2,
  Unlink,
  Save,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/utils/cn";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Tabs } from "@/components/ui/primitives";

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
  const [tab, setTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: <User className="h-3.5 w-3.5" /> },
    { id: "git", label: "Git", icon: <GitBranch className="h-3.5 w-3.5" /> },
    { id: "vercel", label: "Vercel", icon: <Cloud className="h-3.5 w-3.5" /> },
    { id: "ai", label: "AI Model", icon: <Brain className="h-3.5 w-3.5" /> },
  ];

  const fieldClass = cn(
    "h-10 w-full rounded-xl border px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-violet-500/30",
    isDark
      ? "border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
  );

  const labelClass = cn(
    "mb-1.5 block text-xs font-semibold uppercase tracking-wide",
    isDark ? "text-slate-400" : "text-slate-500"
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
      <div>
        <h2 className={cn("text-2xl font-semibold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
          Settings
        </h2>
        <p className={cn("mt-1 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
          Configure profile, Git, Vercel, and AI model preferences.
        </p>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={labelClass}>Full name</label>
              <input
                className={fieldClass}
                value={settings.profile.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                className={fieldClass}
                value={settings.profile.email}
                onChange={(e) => updateProfile({ email: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Workspace name</label>
              <input
                className={fieldClass}
                value={settings.profile.workspace}
                onChange={(e) => updateProfile({ workspace: e.target.value })}
              />
            </div>
            <Button
              variant="primary"
              onClick={() => addToast({ type: "success", title: "Profile saved" })}
            >
              <Save className="h-4 w-4" />
              Save profile
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === "git" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Git integration</CardTitle>
              <Badge variant={settings.git.connected ? "success" : "default"}>
                {settings.git.connected ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> Connected
                  </>
                ) : (
                  "Not connected"
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={labelClass}>Provider</label>
              <select
                className={fieldClass}
                value={settings.git.provider}
                onChange={(e) => updateGitSettings({ provider: e.target.value })}
              >
                <option value="github">GitHub</option>
                <option value="gitlab">GitLab</option>
                <option value="bitbucket">Bitbucket</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Personal access token</label>
              <input
                type="password"
                className={fieldClass}
                placeholder="ghp_••••••••••••"
                value={settings.git.token}
                onChange={(e) => updateGitSettings({ token: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Default organization</label>
              <input
                className={fieldClass}
                placeholder="your-org"
                value={settings.git.defaultOrg}
                onChange={(e) => updateGitSettings({ defaultOrg: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
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
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "vercel" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vercel deployment</CardTitle>
              <Badge variant={settings.vercel.connected ? "success" : "default"}>
                {settings.vercel.connected ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> Connected
                  </>
                ) : (
                  "Not connected"
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={labelClass}>API token</label>
              <input
                type="password"
                className={fieldClass}
                placeholder="vercel_••••••••"
                value={settings.vercel.token}
                onChange={(e) => updateVercelSettings({ token: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Team / scope</label>
              <input
                className={fieldClass}
                placeholder="your-team"
                value={settings.vercel.team}
                onChange={(e) => updateVercelSettings({ team: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
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
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "ai" && (
        <Card>
          <CardHeader>
            <CardTitle>AI model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={labelClass}>Provider</label>
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
            </div>
            <div>
              <label className={labelClass}>Model</label>
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
            </div>
            <div>
              <label className={labelClass}>API key</label>
              <input
                type="password"
                className={fieldClass}
                placeholder="sk-••••••••••••"
                value={settings.ai.apiKey}
                onChange={(e) => updateAiSettings({ apiKey: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Temperature · {settings.ai.temperature.toFixed(1)}</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={settings.ai.temperature}
                onChange={(e) => updateAiSettings({ temperature: Number(e.target.value) })}
                className="w-full accent-violet-500"
              />
            </div>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
