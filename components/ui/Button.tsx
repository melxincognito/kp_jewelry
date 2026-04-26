"use client";

import { forwardRef } from "react";
import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const muiVariant: Record<Variant, MuiButtonProps["variant"]> = {
  primary: "contained",
  secondary: "outlined",
  ghost: "text",
  danger: "contained",
};

const muiSize: Record<Size, MuiButtonProps["size"]> = {
  sm: "small",
  md: "medium",
  lg: "large",
};

const variantSx: Record<Variant, object> = {
  primary: {
    bgcolor: "#1a1714",
    color: "#fdfbf8",
    border: "1px solid #1a1714",
    "&:hover": { bgcolor: "#7a5c10", borderColor: "#7a5c10", color: "#1a1714" },
    "&:active": { bgcolor: "#4a380a", borderColor: "#4a380a" },
    "&.Mui-disabled": { opacity: 0.5, bgcolor: "#1a1714", color: "#fdfbf8", borderColor: "#1a1714" },
  },
  secondary: {
    bgcolor: "transparent",
    color: "#1a1714",
    border: "1px solid #1a1714",
    "&:hover": { bgcolor: "#7a5c10", borderColor: "#7a5c10", color: "#1a1714" },
    "&.Mui-disabled": { opacity: 0.5 },
  },
  ghost: {
    bgcolor: "transparent",
    color: "#7a7470",
    "&:hover": { color: "#1a1714", bgcolor: "rgba(0,0,0,0.04)" },
    "&.Mui-disabled": { opacity: 0.5 },
  },
  danger: {
    bgcolor: "#b91c1c",
    color: "#fff",
    border: "1px solid #b91c1c",
    "&:hover": { bgcolor: "#dc2626", borderColor: "#dc2626" },
    "&:active": { bgcolor: "#991b1b" },
    "&.Mui-disabled": { opacity: 0.5 },
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      onClick,
      type,
      ...props
    },
    ref
  ) => {
    return (
      <MuiButton
        ref={ref}
        variant={muiVariant[variant]}
        size={muiSize[size]}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        fullWidth={fullWidth}
        className={className}
        onClick={onClick}
        type={type as MuiButtonProps["type"]}
        sx={variantSx[variant]}
        startIcon={
          loading ? (
            <CircularProgress
              size={14}
              sx={{ color: "inherit" }}
              aria-hidden="true"
            />
          ) : undefined
        }
      >
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = "Button";
