import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { ProductCard } from "@/components/store/ProductCard";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "KP Jewelrs — Handpicked Jewelry" };

async function getFeaturedProducts() {
  return db.product.findMany({
    where: { status: "AVAILABLE", showOnStorefront: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

export default async function LandingPage() {
  const [session, featured] = await Promise.all([auth(), getFeaturedProducts()]);

  const noUserDetected = session?.user?.id == null;
  const userId = session?.user?.id;

  const unreadCount = userId
    ? await db.message.count({ where: { recipientId: userId, read: false } })
    : 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar session={session} unreadCount={unreadCount} />
      <Box component="main" id="main-content" sx={{ flex: 1 }} tabIndex={-1}>

        {/* Hero */}
        <Box
          component="section"
          aria-labelledby="hero-heading"
          sx={{ bgcolor: "#ede9e3", borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Box sx={{ maxWidth: 896, mx: "auto", px: { xs: 2, sm: 3, lg: 4 }, py: 16, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <Typography aria-hidden="true" sx={{ fontSize: "0.625rem", letterSpacing: "0.5em", color: "primary.main", textTransform: "uppercase", fontWeight: 500 }}>
              Handpicked from Mexico
            </Typography>
            <Typography
              id="hero-heading"
              component="h1"
              sx={{ fontFamily: "serif", fontSize: { xs: "3.75rem", sm: "4.5rem" }, fontWeight: 300, letterSpacing: "0.05em", color: "text.primary", lineHeight: 1.1 }}
            >
              KP <Box component="span" className="text-gold">Jewelrs</Box>
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 448, lineHeight: 2, letterSpacing: "0.05em" }}>
              Curated jewelry for every style. Necklaces, bracelets, rings, earrings and more — all unisex, all authentic.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3, pt: 1 }}>
              <MuiLink
                href="/shop"
                sx={{
                  px: 5, py: 1.5,
                  bgcolor: "text.primary",
                  color: "background.paper",
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  textDecoration: "none",
                  "&:hover": { bgcolor: "primary.main", color: "background.paper" },
                  transition: "background-color 0.15s",
                }}
              >
                Browse Collection
              </MuiLink>
              {noUserDetected && (
                <MuiLink
                  href="/register"
                  sx={{
                    fontSize: "0.75rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "text.secondary",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pb: 0.25,
                    textDecoration: "none",
                    "&:hover": { borderColor: "primary.main", color: "primary.main" },
                    transition: "all 0.15s",
                  }}
                >
                  Create Account
                </MuiLink>
              )}
            </Box>
          </Box>
        </Box>

        {/* Category Quick Links */}
        <Box component="section" sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, lg: 4 }, py: 8 }}>
          <Typography
            id="category-heading"
            variant="caption"
            sx={{ display: "block", letterSpacing: "0.4em", color: "text.secondary", textTransform: "uppercase", mb: 5 }}
          >
            Shop by Category
          </Typography>

          <Box
            component="ul"
            role="list"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
              gap: "1px",
              bgcolor: "divider",
              listStyle: "none",
              p: 0,
              m: 0,
            }}
          >
            {CATEGORIES.map(({ label, type }) => (
              <Box component="li" key={type}>
                <MuiLink
                  href={`/shop?type=${type}`}
                  aria-label={`Shop by Category: ${label}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 3.5,
                    bgcolor: "background.paper",
                    textDecoration: "none",
                    "&:hover": { bgcolor: "#ede9e3", "& .cat-label": { color: "primary.main" } },
                    transition: "background-color 0.15s",
                  }}
                >
                  <Typography
                    className="cat-label"
                    aria-hidden="true"
                    sx={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "text.secondary", transition: "color 0.15s" }}
                  >
                    {label}
                  </Typography>
                </MuiLink>
              </Box>
            ))}
          </Box>
        </Box>

        <Box component="hr" className="divider-gold" sx={{ maxWidth: 1280, mx: "auto", width: "100%", border: "none" }} />

        {/* New Arrivals */}
        {featured.length > 0 && (
          <Box component="section" sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, lg: 4 }, py: 8 }}>
            <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mb: 5 }}>
              <Typography component="h2" sx={{ fontFamily: "serif", fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.05em", color: "text.primary" }}>
                New Arrivals
              </Typography>
              <MuiLink
                href="/shop"
                aria-label="View all new arrivals"
                sx={{
                  fontSize: "0.625rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "text.secondary",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  pb: 0.25,
                  textDecoration: "none",
                  "&:hover": { borderColor: "primary.main", color: "primary.main" },
                  transition: "all 0.15s",
                }}
              >
                View All
              </MuiLink>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Box>
          </Box>
        )}

        {/* About strip */}
        <Box component="section" sx={{ borderTop: "1px solid", borderColor: "divider", bgcolor: "#ede9e3", py: 10 }}>
          <Box sx={{ maxWidth: 672, mx: "auto", px: 2, textAlign: "center", display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography sx={{ fontSize: "0.625rem", letterSpacing: "0.5em", color: "primary.main", textTransform: "uppercase" }}>
              Our Story
            </Typography>
            <Typography component="p" sx={{ fontFamily: "serif", fontSize: "1.25rem", fontWeight: 300, color: "text.primary", lineHeight: 1.7 }}>
              Every piece in our collection is personally sourced from Mexico.
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 2, letterSpacing: "0.05em", maxWidth: 512, mx: "auto", display: "block" }}>
              We specialize in styles like Cubano, Torso, and Cartier chains, as well as charms, rings, earrings and more. Interested in a piece? Create an account and send us a message to coordinate.
            </Typography>
          </Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}

const CATEGORIES = [
  { label: "Necklaces", type: "NECKLACE" },
  { label: "Bracelets", type: "BRACELET" },
  { label: "Rings", type: "RING" },
  { label: "Earrings", type: "EARRING" },
  { label: "Charms", type: "CHARM" },
  { label: "Nose Rings", type: "NOSE_RING" },
  { label: "Clips", type: "CLIP" },
  { label: "Other", type: "OTHER" },
];
