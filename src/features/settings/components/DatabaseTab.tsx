import { Database, Link2, Unlink, Shield } from "lucide-react";
import { useUiStore } from "@/store/ui";
import { useSettings, useSettingsActions } from "@/entities/settings";
import type { DatabaseProvider } from "@/types/settings";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/ui/primitives";
import { SettingsPanel } from "./SettingsPanel";
import { Field, useFieldClasses } from "./Field";

const PROVIDERS: {
  id: DatabaseProvider;
  label: string;
  desc: string;
  port: string;
  hostPlaceholder: string;
  namePlaceholder: string;
  connectionPlaceholder: string;
}[] = [
  {
    id: "neon",
    label: "Neon",
    desc: "Serverless PostgreSQL",
    port: "5432",
    hostPlaceholder: "ep-cool-name.us-east-2.aws.neon.tech",
    namePlaceholder: "neondb",
    connectionPlaceholder: "postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
  {
    id: "mongodb_atlas",
    label: "MongoDB Atlas",
    desc: "Managed document database",
    port: "27017",
    hostPlaceholder: "cluster0.xxxxx.mongodb.net",
    namePlaceholder: "app_data",
    connectionPlaceholder: "mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/app_data",
  },
];

export function DatabaseTab() {
  const addToast = useUiStore((s) => s.addToast);
  const settings = useSettings();
  const { updateDatabaseSettings } = useSettingsActions();
  const { isDark, fieldClass, textAreaClass } = useFieldClasses();
  const activeProvider = PROVIDERS.find((p) => p.id === settings.database.provider) ?? PROVIDERS[0];
  const isNeon = settings.database.provider === "neon";

  return (
    <SettingsPanel
      icon={Database}
      title="Database"
      description="Neon for PostgreSQL and MongoDB Atlas for document storage"
      connected={settings.database.connected}
      footer={
        <>
          <Button
            variant="primary"
            onClick={() => {
              updateDatabaseSettings({ connected: true });
              addToast({
                type: "success",
                title: "Database connected",
                message: activeProvider.label,
              });
            }}
          >
            <Link2 className="h-4 w-4" />
            Test & connect
          </Button>
          {settings.database.connected && (
            <Button
              variant="outline"
              onClick={() => {
                updateDatabaseSettings({ connected: false });
                addToast({ type: "info", title: "Database disconnected" });
              }}
            >
              <Unlink className="h-4 w-4" />
              Disconnect
            </Button>
          )}
        </>
      }
    >
      <Field label="Provider" hint="Stack defaults: Neon (PostgreSQL) and MongoDB Atlas">
        <div className="grid grid-cols-2 gap-3">
          {PROVIDERS.map((option) => {
            const active = settings.database.provider === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  updateDatabaseSettings({
                    provider: option.id,
                    port: option.port,
                    host: option.hostPlaceholder,
                    name: option.namePlaceholder,
                  });
                }}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-all",
                  active
                    ? isDark
                      ? "border-blue-500/40 bg-blue-600/15 ring-1 ring-blue-500/30"
                      : "border-blue-300 bg-blue-50 ring-1 ring-blue-200"
                    : isDark
                      ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                )}
              >
                <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>
                  {option.label}
                </p>
                <p className={cn("mt-0.5 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                  {option.desc}
                </p>
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={isNeon ? "Database name" : "Database / collection DB"}>
          <input
            className={fieldClass}
            placeholder={activeProvider.namePlaceholder}
            value={settings.database.name}
            onChange={(e) => updateDatabaseSettings({ name: e.target.value })}
          />
        </Field>
        <Field label="Port">
          <input
            type="number"
            className={fieldClass}
            value={settings.database.port}
            onChange={(e) => updateDatabaseSettings({ port: e.target.value })}
          />
        </Field>
      </div>

      <Field label={isNeon ? "Neon host" : "Atlas cluster host"}>
        <input
          className={cn(fieldClass, "font-mono text-[13px]")}
          placeholder={activeProvider.hostPlaceholder}
          value={settings.database.host}
          onChange={(e) => updateDatabaseSettings({ host: e.target.value })}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Username">
          <input
            className={fieldClass}
            placeholder={isNeon ? "neondb_owner" : "atlas_user"}
            value={settings.database.username}
            onChange={(e) => updateDatabaseSettings({ username: e.target.value })}
          />
        </Field>
        <Field label="Password">
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
              placeholder="••••••••"
              value={settings.database.password}
              onChange={(e) => updateDatabaseSettings({ password: e.target.value })}
            />
          </div>
        </Field>
      </div>

      <Field
        label="Connection string"
        hint={
          isNeon
            ? "Paste from Neon Console → Connection details (DATABASE_URL)"
            : "Paste from Atlas → Connect → Drivers (mongodb+srv)"
        }
      >
        <textarea
          className={cn(textAreaClass, "font-mono text-[13px]")}
          placeholder={activeProvider.connectionPlaceholder}
          value={settings.database.connectionString}
          onChange={(e) => updateDatabaseSettings({ connectionString: e.target.value })}
        />
      </Field>
    </SettingsPanel>
  );
}
