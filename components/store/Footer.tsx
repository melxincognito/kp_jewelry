import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

export function Footer() {
  return (
    <Box
      component="footer"
      aria-label="Site footer"
      sx={{
        mt: "auto",
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "#ede9e3",
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, lg: 4 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography
            component="span"
            className="text-gold-gradient"
            sx={{ fontSize: "1.125rem", fontWeight: 600, letterSpacing: "0.15em" }}
          >
            KP JEWELRS
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.5, textAlign: "center" }}>
            All items are unisex. Prices listed in USD. Contact seller to coordinate payment.
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4 }}>
            © {new Date().getFullYear()} KP Jewelrs
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
