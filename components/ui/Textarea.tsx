import { TextareaHTMLAttributes, forwardRef, useId } from "react";
import TextField from "@mui/material/TextField";

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "rows"> {
  label?: string;
  error?: string;
  rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, rows = 4, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId =
      id ??
      (label
        ? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}`
        : generatedId);

    return (
      <TextField
        inputRef={ref}
        id={inputId}
        label={label}
        error={!!error}
        helperText={error}
        required={required}
        fullWidth
        multiline
        rows={rows}
        variant="outlined"
        className={className}
        slotProps={{ htmlInput: props as object }}
        sx={{
          "& .MuiOutlinedInput-root": { padding: 0 },
          "& .MuiOutlinedInput-input": { resize: "vertical", padding: "10px 12px" },
          "& .MuiFormHelperText-root": { color: "error.main", fontSize: "0.75rem" },
        }}
      />
    );
  }
);

Textarea.displayName = "Textarea";
