import { CloudCog, Link2, Unlink, Shield } from "lucide-react";
import { useUiStore } from "@/store/ui";
import { useSettings, useSettingsActions } from "@/entities/settings";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/ui/primitives";
import { SettingsPanel } from "./SettingsPanel";
import { Field, useFieldClasses } from "./Field";

export function AzureTab() {
  const addToast = useUiStore((s) => s.addToast);
  const settings = useSettings();
  const { updateAzureSettings } = useSettingsActions();
  const { isDark, fieldClass } = useFieldClasses();

  return (
    <SettingsPanel
      icon={CloudCog}
      title="Azure Settings"
      description="Configure your Azure credentials and subscription"
      connected={settings.azure.connected}
      footer={
        <>
          <Button
            variant="primary"
            onClick={() => {
              updateAzureSettings({ connected: true });
              addToast({ type: "success", title: "Azure connected" });
            }}
          >
            <Link2 className="h-4 w-4" />
            Connect Azure
          </Button>
          {settings.azure.connected && (
            <Button
              variant="outline"
              onClick={() => {
                updateAzureSettings({ connected: false });
                addToast({ type: "info", title: "Azure disconnected" });
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
        <Field label="AZURE_CLIENT_ID" hint="Application (client) ID from Azure AD app registration">
          <input
            className={cn(fieldClass, "font-mono text-[13px]")}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={settings.azure.clientId}
            onChange={(e) => updateAzureSettings({ clientId: e.target.value })}
          />
        </Field>
        <Field label="AZURE_TENANT_ID" hint="Directory (tenant) ID">
          <input
            className={cn(fieldClass, "font-mono text-[13px]")}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={settings.azure.tenantId}
            onChange={(e) => updateAzureSettings({ tenantId: e.target.value })}
          />
        </Field>
      </div>
      <Field label="AZURE_CLIENT_SECRET" hint="Client secret value from Azure AD — stored locally">
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
            placeholder="••••••••••••••••"
            value={settings.azure.clientSecret}
            onChange={(e) => updateAzureSettings({ clientSecret: e.target.value })}
          />
        </div>
      </Field>
      <Field label="AZURE_SUBSCRIPTION_ID" hint="Subscription used for AKS, Cosmos DB, and other resources">
        <input
          className={cn(fieldClass, "font-mono text-[13px]")}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          value={settings.azure.subscriptionId}
          onChange={(e) => updateAzureSettings({ subscriptionId: e.target.value })}
        />
      </Field>
    </SettingsPanel>
  );
}
