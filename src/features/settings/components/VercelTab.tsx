import { Cloud, Link2, Unlink, Shield } from "lucide-react";
import { useUiStore } from "@/store/ui";
import { useSettings, useSettingsActions } from "@/entities/settings";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/ui/primitives";
import { SettingsPanel } from "./SettingsPanel";
import { Field, useFieldClasses } from "./Field";

export function VercelTab() {
  const addToast = useUiStore((s) => s.addToast);
  const settings = useSettings();
  const { updateVercelSettings } = useSettingsActions();
  const { isDark, fieldClass } = useFieldClasses();

  return (
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
      <Field label="API token" hint="Create a token at vercel.com/account/tokens with full project access">
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
  );
}
