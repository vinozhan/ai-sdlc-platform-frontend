import { GitBranch, Link2, Unlink, Shield } from "lucide-react";
import { useUiStore } from "@/store/ui";
import { useSettings, useSettingsActions } from "@/entities/settings";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/ui/primitives";
import { SettingsPanel } from "./SettingsPanel";
import { Field, useFieldClasses } from "./Field";

export function GitTab() {
  const addToast = useUiStore((s) => s.addToast);
  const settings = useSettings();
  const { updateGitSettings } = useSettingsActions();
  const { isDark, fieldClass } = useFieldClasses();

  return (
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
      <Field label="Personal access token" hint="Stored locally. Required scopes: repo, read:org">
        <div className="relative">
          <Shield
            className={cn(
              "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2",
              isDark ? "text-slate-500" : "text-slate-400"
            )}
          />
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
  );
}
