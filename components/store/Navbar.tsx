"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";

interface NavbarProps {
  session: Session | null;
  unreadCount?: number;
}

export function Navbar({ session, unreadCount = 0 }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const isCustomer = session?.user?.role === "CUSTOMER";
  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  const navLinkSx = (active: boolean) => ({
    fontSize: "0.875rem",
    letterSpacing: "0.04em",
    textDecoration: "none",
    color: active ? "primary.main" : "text.secondary",
    "&:hover": { color: "text.primary" },
    transition: "color 0.15s",
  });

  return (
    <>
      <AppBar position="sticky" component="header">
        <Toolbar
          sx={{
            maxWidth: "80rem",
            width: "100%",
            mx: "auto",
            px: { xs: 2, sm: 3, lg: 4 },
            minHeight: "64px !important",
          }}
        >
          {/* Logo */}
          <MuiLink
            component={NextLink}
            href="/"
            underline="none"
            sx={{ display: "flex", alignItems: "center", mr: "auto" }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "1.125rem",
                fontWeight: 300,
                letterSpacing: "0.25em",
                color: "text.primary",
                textTransform: "uppercase",
              }}
            >
              KP{" "}
              <Box component="span" className="text-gold">
                Jewelry
              </Box>
            </Typography>
          </MuiLink>

          {/* Desktop Nav */}
          <Box
            component="nav"
            aria-label="Main navigation"
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 3,
            }}
          >
            <MuiLink
              component={NextLink}
              href="/shop"
              sx={navLinkSx(pathname.startsWith("/shop"))}
            >
              Shop
            </MuiLink>

            {isCustomer && (
              <MuiLink
                component={NextLink}
                href="/messages"
                aria-label={
                  unreadCount > 0
                    ? `Messages, ${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`
                    : undefined
                }
                sx={navLinkSx(pathname.startsWith("/messages"))}
              >
                <Badge
                  badgeContent={unreadCount > 0 ? displayCount : 0}
                  color="error"
                  sx={{ "& .MuiBadge-badge": { fontSize: "0.625rem" } }}
                >
                  Messages
                </Badge>
              </MuiLink>
            )}

            {isAdmin && (
              <MuiLink
                component={NextLink}
                href="/dashboard"
                sx={navLinkSx(pathname.startsWith("/dashboard"))}
              >
                Dashboard
              </MuiLink>
            )}
          </Box>

          {/* Auth Actions (desktop) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1.5,
              ml: 3,
            }}
          >
            {session ? (
              <>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {session.user?.name ?? session.user?.email}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  sx={{
                    color: "text.secondary",
                    textTransform: "none",
                    fontSize: "0.75rem",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <MuiLink
                  component={NextLink}
                  href="/login"
                  sx={{
                    fontSize: "0.875rem",
                    color: "text.secondary",
                    textDecoration: "none",
                    "&:hover": { color: "text.primary" },
                  }}
                >
                  Sign in
                </MuiLink>
                <Button
                  component={NextLink}
                  href="/register"
                  variant="outlined"
                  size="small"
                  sx={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    borderColor: "text.primary",
                    color: "text.primary",
                    "&:hover": {
                      bgcolor: "primary.light",
                      borderColor: "primary.light",
                      color: "text.primary",
                    },
                  }}
                >
                  Create account
                </Button>
              </>
            )}
          </Box>

          {/* Mobile hamburger */}
          <IconButton
            sx={{ display: { md: "none" }, color: "text.secondary" }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <Box sx={{ width: 20, height: 1.5, bgcolor: "currentColor" }} />
              <Box sx={{ width: 20, height: 1.5, bgcolor: "currentColor" }} />
              <Box sx={{ width: 20, height: 1.5, bgcolor: "currentColor" }} />
            </Box>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        id="mobile-menu"
        anchor="top"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { md: "none" } }}
        slotProps={{
          paper: {
            sx: {
              top: 64,
              bgcolor: "#ede9e3",
              border: "none",
              borderBottom: "1px solid",
              borderColor: "divider",
              px: 2,
              py: 2,
            },
          },
        }}
        hideBackdrop
        disableScrollLock
      >
        <Box
          component="nav"
          role="navigation"
          aria-label="Mobile navigation"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <MuiLink
            component={NextLink}
            href="/shop"
            sx={{
              fontSize: "0.875rem",
              color: "text.secondary",
              textDecoration: "none",
            }}
            onClick={() => setMobileOpen(false)}
          >
            Shop
          </MuiLink>

          {isCustomer && (
            <MuiLink
              component={NextLink}
              href="/messages"
              sx={{
                fontSize: "0.875rem",
                color: "text.secondary",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
              onClick={() => setMobileOpen(false)}
            >
              Messages
              {unreadCount > 0 && (
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "1.1rem",
                    height: "1.1rem",
                    px: "3px",
                    borderRadius: "50%",
                    bgcolor: "error.main",
                    color: "#fff",
                    fontSize: "0.625rem",
                    fontWeight: 600,
                  }}
                >
                  {displayCount}
                </Box>
              )}
            </MuiLink>
          )}

          {isAdmin && (
            <MuiLink
              component={NextLink}
              href="/dashboard"
              sx={{
                fontSize: "0.875rem",
                color: "text.secondary",
                textDecoration: "none",
              }}
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </MuiLink>
          )}

          <Divider sx={{ borderColor: "divider" }} />

          {session ? (
            <Button
              variant="text"
              onClick={() => signOut({ callbackUrl: "/" })}
              sx={{
                alignSelf: "flex-start",
                color: "text.secondary",
                textTransform: "none",
                p: 0,
                fontSize: "0.875rem",
              }}
            >
              Sign out
            </Button>
          ) : (
            <>
              <MuiLink
                component={NextLink}
                href="/login"
                sx={{
                  fontSize: "0.875rem",
                  color: "text.secondary",
                  textDecoration: "none",
                }}
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </MuiLink>
              <MuiLink
                component={NextLink}
                href="/register"
                sx={{
                  fontSize: "0.875rem",
                  color: "primary.main",
                  textDecoration: "none",
                }}
                onClick={() => setMobileOpen(false)}
              >
                Create account
              </MuiLink>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}
