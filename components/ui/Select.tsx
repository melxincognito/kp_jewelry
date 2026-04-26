import { SelectHTMLAttributes, forwardRef } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, value, onChange, required, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <TextField
        select
        id={inputId}
        label={label}
        error={!!error}
        helperText={error}
        required={required}
        fullWidth
        variant="outlined"
        className={className}
        value={value ?? ""}
        onChange={onChange as unknown as React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>}
        sx={{
          "& .MuiFormHelperText-root": { color: "error.main", fontSize: "0.75rem" },
          cursor: "pointer",
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }
);

Select.displayName = "Select";
