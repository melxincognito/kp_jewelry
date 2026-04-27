import { InputHTMLAttributes, forwardRef, useId } from "react";
import TextField from "@mui/material/TextField";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId =
      id ??
      (label
        ? `input-${label.toLowerCase().replace(/\s+/g, "-")}`
        : generatedId);

    return (
      <TextField
        inputRef={ref}
        id={inputId}
        label={label}
        error={!!error}
        helperText={error ?? hint ?? undefined}
        required={required}
        fullWidth
        variant="outlined"
        className={className}
        slotProps={{
          formHelperText: {
            role: error ? "alert" : undefined,
            sx: { color: error ? "error.main" : "text.secondary" },
          },
          htmlInput: { ...(props as object), ...(required ? { "aria-required": "true" } : {}) },
        }}
        sx={{
          "& .MuiFormHelperText-root": {
            color: error ? "error.main" : "text.secondary",
            fontSize: "0.75rem",
          },
        }}
      />
    );
  }
);

Input.displayName = "Input";
