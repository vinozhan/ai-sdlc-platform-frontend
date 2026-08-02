import { User, Save } from "lucide-react";
import { useUiStore } from "@/store/ui";
import { useSettings, useSettingsActions } from "@/entities/settings";
import { Button } from "@/shared/ui/primitives";
import { ProfilePhotoEditor } from "@/shared/ui/brand/UserAvatar";
import { SettingsPanel } from "./SettingsPanel";
import { Field, useFieldClasses } from "./Field";

export function ProfileTab() {
  const addToast = useUiStore((s) => s.addToast);
  const settings = useSettings();
  const { updateProfile } = useSettingsActions();
  const { isDark, fieldClass } = useFieldClasses();

  return (
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
      <ProfilePhotoEditor
        isDark={isDark}
        name={settings.profile.name}
        email={settings.profile.email}
        avatarUrl={settings.profile.avatarUrl}
        onAvatarChange={(dataUrl) => {
          void updateProfile({ avatarUrl: dataUrl });
          addToast({ type: "success", title: "Photo updated" });
        }}
        onAvatarRemove={() => {
          void updateProfile({ avatarUrl: null });
          addToast({ type: "info", title: "Photo removed" });
        }}
        onError={(title, message) => addToast({ type: "error", title, message })}
      />

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
  );
}
