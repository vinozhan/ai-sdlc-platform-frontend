import { useRef, type ChangeEvent } from "react";
import { Camera, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { useStore } from "@/store/useStore";
import defaultAvatar from "@/assets/avatar-default.jpg";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type UserAvatarProps = {
  size?: "sm" | "md" | "lg";
  /** Hover overlay with change/remove actions */
  editable?: boolean;
  className?: string;
};

const sizeClass = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
} as const;

function resolveAvatar(avatarUrl: string | null | undefined) {
  if (avatarUrl === null) return null;
  if (avatarUrl === undefined || avatarUrl === "") return defaultAvatar;
  return avatarUrl;
}

export function UserAvatar({ size = "sm", editable = false, className }: UserAvatarProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { settings, updateProfile, addToast } = useStore();
  const { name, avatarUrl } = settings.profile;
  const src = resolveAvatar(avatarUrl);

  const onPick = () => fileRef.current?.click();

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast({ type: "error", title: "Invalid file", message: "Please choose an image" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast({ type: "error", title: "Image too large", message: "Max size is 2MB" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatarUrl: String(reader.result) });
      addToast({ type: "success", title: "Photo updated" });
    };
    reader.readAsDataURL(file);
  };

  const onRemove = () => {
    updateProfile({ avatarUrl: null });
    addToast({ type: "info", title: "Photo removed" });
  };

  return (
    <div className={cn("relative shrink-0", sizeClass[size], className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-full object-cover shadow-sm ring-2 ring-white"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 font-bold text-white shadow-sm">
          {initialsOf(name)}
        </span>
      )}

      {editable && (
        <>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-full bg-slate-950/55 opacity-0 backdrop-blur-[1px] transition-opacity hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              title="Change photo"
              aria-label="Change photo"
              onClick={onPick}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-800 shadow-sm transition hover:bg-blue-50 hover:text-blue-600"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            {src && (
              <button
                type="button"
                title="Remove photo"
                aria-label="Remove photo"
                onClick={onRemove}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-600 shadow-sm transition hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Settings-style photo card: avatar + Change / Remove actions. */
export function ProfilePhotoEditor({ isDark }: { isDark: boolean }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { settings, updateProfile, addToast } = useStore();
  const { name, email, avatarUrl } = settings.profile;
  const src = resolveAvatar(avatarUrl);

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast({ type: "error", title: "Invalid file", message: "Please choose an image" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast({ type: "error", title: "Image too large", message: "Max size is 2MB" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatarUrl: String(reader.result) });
      addToast({ type: "success", title: "Photo updated" });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center",
        isDark ? "border-white/10" : "border-slate-200"
      )}
    >
      <UserAvatar size="lg" editable />
      <div className="min-w-0 flex-1">
        <p className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>{name}</p>
        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>{email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              isDark
                ? "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-600"
            )}
          >
            <Camera className="h-3.5 w-3.5" />
            Change photo
          </button>
          {src && (
            <button
              type="button"
              onClick={() => {
                updateProfile({ avatarUrl: null });
                addToast({ type: "info", title: "Photo removed" });
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                isDark
                  ? "border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                  : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
        <p className={cn("mt-2 text-[11px]", isDark ? "text-slate-500" : "text-slate-400")}>
          JPG or PNG, up to 2MB. Hover the photo for quick actions.
        </p>
      </div>
    </div>
  );
}
