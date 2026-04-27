"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import MuiLink from "@mui/material/Link";
import Badge from "@mui/material/Badge";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "◈" },
  { href: "/dashboard/inventory", label: "Inventory", icon: "◻" },
  { href: "/dashboard/sales", label: "Sales", icon: "◆" },
  { href: "/dashboard/messages", label: "Messages", icon: "◇" },
  { href: "/dashboard/users", label: "Users", icon: "◉" },
];

const DRAWER_WIDTH = 208;

interface DashboardNavProps {
  unreadCount?: number;
}

export function DashboardNav({ unreadCount = 0 }: DashboardNavProps) {
  const pathname = usePathname();
  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          bgcolor: "#ede9e3",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <MuiLink
          component={NextLink}
          href="/"
          underline="none"
          className="text-gold-gradient"
          sx={{
            fontSize: "0.875rem",
            fontWeight: 600,
            letterSpacing: "0.15em",
            display: "block",
          }}
        >
          KP JEWELRY
        </MuiLink>
        <Typography
          sx={{
            fontSize: "0.625rem",
            color: "text.secondary",
            opacity: 0.4,
            mt: 0.5,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Dashboard
        </Typography>
      </Box>

      {/* Nav links */}
      <Box component="nav" aria-label="Dashboard navigation" sx={{ flex: 1 }}>
      <List sx={{ py: 1, px: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const isMessages = item.href === "/dashboard/messages";
          const showBadge = isMessages && unreadCount > 0;

          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                component={NextLink}
                href={item.href}
                selected={isActive}
                aria-current={isActive ? "page" : undefined}
                aria-label={
                  showBadge ? `Messages, ${unreadCount} unread` : undefined
                }
                sx={{ py: 1, px: 1.5 }}
              >
                <Box
                  component="span"
                  sx={{ mr: 1.5, fontSize: "0.75rem", opacity: 0.7 }}
                >
                  {item.icon}
                </Box>
                <ListItemText
                  primary={
                    isMessages ? (
                      <Badge
                        badgeContent={showBadge ? displayCount : 0}
                        color="error"
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: "0.6rem",
                            right: -14,
                            top: 2,
                          },
                        }}
                      >
                        {item.label}
                      </Badge>
                    ) : (
                      item.label
                    )
                  }
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: "0.875rem",
                        fontWeight: isActive ? 500 : 400,
                        color: isActive ? "primary.main" : "text.secondary",
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      </Box>

      {/* Bottom: sign out */}
      <Box
        sx={{ px: 2, py: 2, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Divider sx={{ mb: 1.5, borderColor: "transparent" }} />
        <Typography
          component="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          sx={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "0.75rem",
            color: "text.secondary",
            opacity: 0.5,
            textAlign: "left",
            p: 0,
            "&:hover": { opacity: 1, color: "error.main" },
            transition: "all 0.15s",
          }}
        >
          Sign out
        </Typography>
      </Box>
    </Drawer>
  );
}
