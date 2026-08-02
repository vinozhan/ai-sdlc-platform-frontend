import { Database, Link2, Unlink, Shield } from "lucide-react";
import { useUiStore } from "@/store/ui";
import { useSettings, useSettingsActions } from "@/entities/settings";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/ui/primitives";
import { SettingsPanel } from "./SettingsPanel";
import { Field, useFieldClasses } from "./Field";

const SQL_ENGINES = [
  { value: "postgresql", label: "PostgreSQL", defaultPort: "5432" },
  { value: "mysql", label: "MySQL", defaultPort: "3306" },
  { value: "sqlserver", label: "Azure SQL", defaultPort: "1433" },
] as const;

const NOSQL_ENGINES = [
  { value: "mongodb", label: "MongoDB", defaultPort: "27017" },
  { value: "cosmosdb", label: "Azure Cosmos DB", defaultPort: "443" },
  { value: "redis", label: "Redis", defaultPort: "6379" },
] as const;

export function DatabaseTab() {
  const addToast = useUiStore((s) => s.addToast);
  const settings = useSettings();
  const { updateDatabaseSettings } = useSettingsActions();
  const { isDark, fieldClass, textAreaClass } = useFieldClasses();
  const dbEngines = settings.database.type === "sql" ? SQL_ENGINES : NOSQL_ENGINES;

  return (
    <SettingsPanel
      icon={Database}
      title="Database Configuration"
      description="Connect SQL or NoSQL storage used by generated backends"
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
                message: `${settings.database.type === "sql" ? "SQL" : "NoSQL"} · ${settings.database.engine}`,
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
      <Field
        label="Database type"
        hint="NexusPay defaults to SQL (PostgreSQL); NoSQL for flexible document stores like MediTrack"
      >
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { id: "sql" as const, label: "SQL", desc: "PostgreSQL, MySQL, Azure SQL" },
              { id: "nosql" as const, label: "NoSQL", desc: "MongoDB, Cosmos DB, Redis" },
            ] as const
          ).map((option) => {
            const active = settings.database.type === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  const engines = option.id === "sql" ? SQL_ENGINES : NOSQL_ENGINES;
                  const engine = engines[0];
                  updateDatabaseSettings({
                    type: option.id,
                    engine: engine.value,
                    port: engine.defaultPort,
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
        <Field label="Engine">
          <select
            className={fieldClass}
            value={settings.database.engine}
            onChange={(e) => {
              const engine = dbEngines.find((item) => item.value === e.target.value);
              updateDatabaseSettings({
                engine: e.target.value,
                ...(engine ? { port: engine.defaultPort } : {}),
              });
            }}
          >
            {dbEngines.map((engine) => (
              <option key={engine.value} value={engine.value}>
                {engine.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Database name">
          <input
            className={fieldClass}
            placeholder={settings.database.type === "sql" ? "nexuspay" : "app_data"}
            value={settings.database.name}
            onChange={(e) => updateDatabaseSettings({ name: e.target.value })}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Host / endpoint" className="sm:col-span-2">
          <input
            className={cn(fieldClass, "font-mono text-[13px]")}
            placeholder={
              settings.database.type === "sql" ? "db.example.com" : "cluster0.xxxxx.mongodb.net"
            }
            value={settings.database.host}
            onChange={(e) => updateDatabaseSettings({ host: e.target.value })}
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

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Username">
          <input
            className={fieldClass}
            placeholder="db_user"
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
        hint="Optional. Used as DATABASE_URL in deploy manifests when provided"
      >
        <textarea
          className={cn(textAreaClass, "font-mono text-[13px]")}
          placeholder={
            settings.database.type === "sql"
              ? "postgresql://user:pass@host:5432/nexuspay"
              : "mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/app_data"
          }
          value={settings.database.connectionString}
          onChange={(e) => updateDatabaseSettings({ connectionString: e.target.value })}
        />
      </Field>
    </SettingsPanel>
  );
}
