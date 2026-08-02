import { Brain, Save, Shield } from "lucide-react";
import { useUiStore } from "@/store/ui";
import { useSettings, useSettingsActions } from "@/entities/settings";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/ui/primitives";
import { SettingsPanel } from "./SettingsPanel";
import { Field, useFieldClasses } from "./Field";

export function AiTab() {
  const addToast = useUiStore((s) => s.addToast);
  const settings = useSettings();
  const { updateAiSettings } = useSettingsActions();
  const { isDark, fieldClass } = useFieldClasses();

  return (
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
          <Shield
            className={cn(
              "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2",
              isDark ? "text-slate-500" : "text-slate-400"
            )}
          />
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
            <span
              className={cn(
                "rounded-lg px-2.5 py-1 text-sm font-semibold tabular-nums",
                isDark ? "bg-blue-600/20 text-blue-300" : "bg-blue-100 text-blue-700"
              )}
            >
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
  );
}
