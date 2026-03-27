import { TextareaHTMLAttributes, forwardRef, useId } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? (label ? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}` : generatedId);
    const errorId = `${inputId}-error`;

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
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-required={props.required || undefined}
          className={[
            "w-full rounded-sm px-3 py-2.5 text-sm resize-y",
            "bg-[var(--black-card)] border border-[var(--black-border)]",
            "text-[var(--white)] placeholder:text-[var(--white-dim)]/50",
            "focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/30",
            "transition-colors duration-150",
            error ? "border-red-500" : "",
            className,
          ].join(" ")}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
