interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
}

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div className="bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-[var(--white-dim)] uppercase tracking-widest">
          {title}
        </p>
        {icon && (
          <span className="text-[var(--gold)] opacity-70">{icon}</span>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold text-[var(--white)]">{value}</p>
        {subtitle && (
          <p className="text-xs text-[var(--white-dim)]/60 mt-1">{subtitle}</p>
        )}
      </div>
      {trend && (
        <p
          className={`text-xs font-medium ${
            trend.value >= 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  );
}
