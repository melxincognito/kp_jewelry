type BadgeVariant = "gold" | "outline" | "status-available" | "status-reserved" | "status-sold";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  gold: "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/25",
  outline: "border border-[var(--black-border)] text-[var(--white-dim)]",
  "status-available": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "status-reserved": "bg-amber-50 text-amber-700 border border-amber-200",
  "status-sold": "bg-[var(--black-soft)] text-[var(--white-dim)] border border-[var(--black-border)]",
};

export function Badge({ children, variant = "outline", className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium tracking-wide",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
