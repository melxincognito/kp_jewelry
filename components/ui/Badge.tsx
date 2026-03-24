type BadgeVariant = "gold" | "outline" | "status-available" | "status-reserved" | "status-sold";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  gold: "bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30",
  outline: "border border-[var(--black-border)] text-[var(--white-dim)]",
  "status-available": "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  "status-reserved": "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  "status-sold": "bg-zinc-700/60 text-zinc-400 border border-zinc-600/30",
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
