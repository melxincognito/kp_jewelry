import Chip from "@mui/material/Chip";

type BadgeVariant = "gold" | "outline" | "status-available" | "status-reserved" | "status-sold";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantSx: Record<BadgeVariant, object> = {
  gold: {
    bgcolor: "rgba(122,92,16,0.08)",
    color: "#7a5c10",
    border: "1px solid rgba(122,92,16,0.25)",
  },
  outline: {
    bgcolor: "transparent",
    color: "text.secondary",
    border: "1px solid",
    borderColor: "divider",
  },
  "status-available": {
    bgcolor: "#ecfdf5",
    color: "#065f46",
    border: "1px solid #a7f3d0",
  },
  "status-reserved": {
    bgcolor: "#fffbeb",
    color: "#92400e",
    border: "1px solid #fcd34d",
  },
  "status-sold": {
    bgcolor: "#ede9e3",
    color: "#7a7470",
    border: "1px solid #ddd6cc",
  },
};

export function Badge({ children, variant = "outline", className }: BadgeProps) {
  return (
    <Chip
      label={children}
      size="small"
      className={className}
      sx={{
        ...variantSx[variant],
        fontWeight: 500,
        letterSpacing: "0.04em",
      }}
    />
  );
}
