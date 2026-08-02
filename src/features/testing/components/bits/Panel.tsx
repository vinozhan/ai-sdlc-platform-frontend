import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives";

/** The app's Card, with the header slots this page needs. */
export function Panel({
  icon,
  label,
  title,
  meta,
  action,
  children,
  className,
  bodyClassName,
}: {
  icon?: ReactNode;
  label?: string;
  title?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={className}>
      {(label || title || action) && (
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0 flex-1">
              {label && (
                <CardTitle className="flex items-center gap-2">
                  {icon}
                  {label}
                </CardTitle>
              )}
              {title && <p className="mt-1 text-xs text-[color:var(--tp-ink-2)]">{title}</p>}
              {meta && <p className="tp-den mt-1">{meta}</p>}
            </div>
            {action}
          </div>
        </CardHeader>
      )}
      <CardContent className={bodyClassName}>{children}</CardContent>
    </Card>
  );
}

export function Hairline({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-[color:var(--tp-line)]", className)} />;
}
