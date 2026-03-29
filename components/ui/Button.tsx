"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--white)] text-[var(--black-card)] font-medium tracking-[0.1em] uppercase text-xs hover:bg-[var(--gold)] hover:text-[var(--black-card)] active:bg-[var(--gold-dark)] active:text-[var(--black-card)] disabled:opacity-50",
  secondary:
    "border border-[var(--white)] text-[var(--white)] hover:bg-[var(--gold)] hover:border-[var(--gold)] hover:text-[var(--black-card)] disabled:opacity-50",
  ghost:
    "text-[var(--white-dim)] hover:text-[var(--white)] hover:bg-[var(--black-soft)] disabled:opacity-50",
  danger:
    "bg-red-700 text-white hover:bg-red-600 active:bg-red-800 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-sm transition-colors duration-150 cursor-pointer",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {loading && (
          <span
            aria-hidden="true"
            className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
