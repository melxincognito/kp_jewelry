export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "h-6 w-6 border-2 border-[var(--gold)]/30 border-t-[var(--gold)] rounded-full animate-spin",
        className,
      ].join(" ")}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner className="h-8 w-8" />
    </div>
  );
}
