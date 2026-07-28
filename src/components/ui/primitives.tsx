import { type ReactNode, type HTMLAttributes, forwardRef } from "react";
import { useStore } from "@/store/useStore";
import { cn } from "@/utils/cn";

// ===== Card =====
export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  return (
    <div
      className={cn(
        "rounded-2xl border transition-colors",
        isDark
          ? "border-white/[0.06] bg-[#0f1d32]/80"
          : "border-slate-200/80 bg-white shadow-sm shadow-slate-200/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  return (
    <div className={cn("border-b px-4 py-3 sm:px-5 sm:py-4", isDark ? "border-white/[0.05]" : "border-slate-100", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  return (
    <h3 className={cn("text-sm font-semibold tracking-tight", isDark ? "text-white" : "text-slate-900", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4 sm:p-5", className)} {...props}>
      {children}
    </div>
  );
}

// ===== Badge =====
type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "c1" | "c2" | "c3" | "c4";

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-600 border-slate-200/80 dark:bg-white/5 dark:text-slate-300 dark:border-white/10",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  warning: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  error: "bg-red-50 text-red-700 border-red-200/80 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  info: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  c1: "bg-green-50 text-green-700 border-green-200/80 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  c2: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  c3: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  c4: "bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ===== Button =====
type ButtonVariant = "default" | "outline" | "ghost" | "c1" | "c2" | "c3" | "c4" | "error" | "success" | "primary";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonVariants: Record<ButtonVariant, string> = {
  default: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 dark:border-white/10",
  outline: "bg-transparent text-slate-600 hover:bg-slate-100 border-slate-200 dark:text-slate-300 dark:hover:bg-white/5 dark:border-white/10",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent dark:text-slate-300 dark:hover:bg-white/5 dark:border-transparent",
  primary: "bg-blue-600 text-white hover:bg-blue-500 border-blue-600 shadow-lg shadow-blue-500/20",
  c1: "bg-green-600 text-white hover:bg-green-500 border-green-600",
  c2: "bg-blue-600 text-white hover:bg-blue-500 border-blue-600",
  c3: "bg-blue-600 text-white hover:bg-blue-500 border-blue-600",
  c4: "bg-orange-600 text-white hover:bg-orange-500 border-orange-600",
  error: "bg-red-600 text-white hover:bg-red-500 border-red-600",
  success: "bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-600",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
  icon: "h-9 w-9 p-0",
};

export function Button({
  variant = "default",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: HTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ===== Progress =====
export function Progress({ value, className, color = "#2563eb" }: { value: number; className?: string; color?: string }) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full", isDark ? "bg-white/10" : "bg-slate-100", className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ===== Tabs =====
export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  return (
    <div
      className={cn(
        "inline-flex gap-1 rounded-2xl p-1",
        isDark ? "bg-white/[0.04]" : "bg-slate-100/80",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all",
            active === tab.id
              ? isDark
                ? "bg-white/10 text-white shadow-sm"
                : "bg-white text-slate-900 shadow-sm"
              : isDark
              ? "text-slate-400 hover:text-slate-200"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ===== Status Dot =====
export function StatusDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: color }} />
      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}

// ===== Skeleton =====
export function Skeleton({ className }: { className?: string }) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  return <div className={cn("animate-pulse rounded-lg", isDark ? "bg-white/10" : "bg-slate-200", className)} />;
}

// ===== Ring Progress =====
export function RingProgress({
  value,
  size = 120,
  strokeWidth = 10,
  color = "#2563eb",
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-xl font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
          {label ?? `${value}%`}
        </span>
        {sublabel && (
          <span className={cn("text-[10px]", isDark ? "text-slate-500" : "text-slate-400")}>{sublabel}</span>
        )}
      </div>
    </div>
  );
}

// ===== Code Block =====
export const CodeBlock = forwardRef<HTMLPreElement, { code: string; language?: string; className?: string }>(
  ({ code, language, className }, ref) => {
    const { theme } = useStore();
    const isDark = theme === "dark";
    return (
      <pre
        ref={ref}
        className={cn(
          "overflow-auto rounded-xl p-4 text-xs leading-relaxed font-mono border",
          isDark
            ? "bg-[#0a0e17] text-slate-300 border-white/5"
            : "bg-slate-50 text-slate-700 border-slate-200",
          className
        )}
      >
        <code className={`language-${language}`}>{code}</code>
      </pre>
    );
  }
);
CodeBlock.displayName = "CodeBlock";

// ===== Table =====
export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto scroll-touch scrollbar-thin", className)}>
      <table className="w-full min-w-[520px] text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  return (
    <th
      className={cn(
        "border-b px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider",
        isDark ? "border-white/5 text-slate-500" : "border-slate-100 text-slate-400",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ children, className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  return (
    <td
      className={cn(
        "border-b px-3 py-2.5",
        isDark ? "border-white/[0.04] text-slate-300" : "border-slate-50 text-slate-600",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

// ===== Page Header helper =====
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const { theme } = useStore();
  const isDark = theme === "dark";
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 className={cn("text-2xl font-semibold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
          {title}
        </h2>
        {description && (
          <p className={cn("mt-1 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
