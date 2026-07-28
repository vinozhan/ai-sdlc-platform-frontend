import { cn } from "@/utils/cn";
import nexusLogo from "@/assets/nexus-logo.png";
import nexusLogoLight from "@/assets/nexus-logo-light.png";

type NexusWordmarkProps = {
  className?: string;
  /** Use light logo variant on dark backgrounds (e.g. footer) */
  dark?: boolean;
  compact?: boolean;
};

/** Official NEXUS logo lockup (icon + wordmark) — transparent PNG. */
export function NexusWordmark({ className, dark = false, compact = false }: NexusWordmarkProps) {
  const src = dark ? nexusLogoLight : nexusLogo;

  if (compact) {
    return (
      <img
        src={src}
        alt="Nexus"
        className={cn("h-8 w-8 object-cover object-left", className)}
      />
    );
  }

  return (
    <img
      src={src}
      alt="Nexus"
      className={cn("h-9 w-auto max-w-full bg-transparent object-contain object-left", className)}
    />
  );
}
