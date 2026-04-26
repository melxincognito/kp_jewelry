import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <CircularProgress
      size={24}
      className={className}
      sx={{ color: "primary.main" }}
    />
  );
}

export function PageLoader() {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
      }}
    >
      <LoadingSpinner />
    </Box>
  );
}
