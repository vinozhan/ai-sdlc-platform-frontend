import { Server, Link2, Unlink, Shield } from "lucide-react";
import { useUiStore } from "@/store/ui";
import { useSettings, useSettingsActions } from "@/entities/settings";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/ui/primitives";
import { SettingsPanel } from "./SettingsPanel";
import { Field, useFieldClasses } from "./Field";

export function RenderTab() {
  const addToast = useUiStore((s) => s.addToast);
  const settings = useSettings();
  const { updateRenderSettings } = useSettingsActions();
  const { isDark, fieldClass } = useFieldClasses();

  return (
    <SettingsPanel
      icon={Server}
      title="Render backend"
      description="Deploy and manage API services on Render"
      connected={settings.render.connected}
      footer={
        <>
          <Button
            variant="primary"
            onClick={() => {
              updateRenderSettings({ connected: true });
              addToast({ type: "success", title: "Render connected" });
            }}
          >
            <Link2 className="h-4 w-4" />
            Connect Render
          </Button>
          {settings.render.connected && (
            <Button
              variant="outline"
              onClick={() => {
                updateRenderSettings({ connected: false });
                addToast({ type: "info", title: "Render disconnected" });
              }}
            >
              <Unlink className="h-4 w-4" />
              Disconnect
            </Button>
          )}
        </>
      }
    >
      <Field label="API key" hint="Create a key at dashboard.render.com → Account Settings → API Keys">
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
            placeholder="rnd_••••••••"
            value={settings.render.apiKey}
            onChange={(e) => updateRenderSettings({ apiKey: e.target.value })}
          />
        </div>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Service ID" hint="Target web service or private service for this project">
          <input
            className={cn(fieldClass, "font-mono text-[13px]")}
            placeholder="srv-xxxxxxxxxxxxxxxxxxxx"
            value={settings.render.serviceId}
            onChange={(e) => updateRenderSettings({ serviceId: e.target.value })}
          />
        </Field>
        <Field label="Region" hint="Primary deploy region for backend services">
          <select
            className={fieldClass}
            value={settings.render.region}
            onChange={(e) => updateRenderSettings({ region: e.target.value })}
          >
            <option value="oregon">Oregon (US West)</option>
            <option value="ohio">Ohio (US East)</option>
            <option value="frankfurt">Frankfurt (EU)</option>
            <option value="singapore">Singapore (Asia)</option>
          </select>
        </Field>
      </div>
    </SettingsPanel>
  );
}
