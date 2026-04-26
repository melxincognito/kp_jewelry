import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
}

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontWeight: 500,
              fontSize: "0.65rem",
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box sx={{ color: "primary.main", opacity: 0.7, fontSize: "1rem" }}>
              {icon}
            </Box>
          )}
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.2 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.6, mt: 0.5, display: "block" }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {trend && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 500,
              color: trend.value >= 0 ? "#059669" : "#b91c1c",
            }}
          >
            {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}% {trend.label}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
