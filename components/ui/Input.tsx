import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--white-dim)] tracking-wide"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full rounded-sm px-3 py-2.5 text-sm",
            "bg-[var(--black-card)] border border-[var(--black-border)]",
            "text-[var(--white)] placeholder:text-[var(--white-dim)]/50",
            "focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/30",
            "transition-colors duration-150",
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "",
            className,
          ].join(" ")}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--white-dim)]/60">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
