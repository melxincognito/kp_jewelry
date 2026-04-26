"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MuiButton from "@mui/material/Button";
import type { Role } from "@/types/enums";

export function UserRoleToggle({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: Role;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const newRole: Role = currentRole === "ADMIN" ? "CUSTOMER" : "ADMIN";
    await fetch(`/api/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <MuiButton
      onClick={toggle}
      disabled={loading}
      variant="outlined"
      size="small"
      sx={{
        fontSize: "0.7rem",
        textTransform: "none",
        letterSpacing: "normal",
        px: 1.25,
        py: 0.5,
        borderColor: currentRole === "ADMIN" ? "rgba(185,28,28,0.3)" : "rgba(122,92,16,0.3)",
        color: currentRole === "ADMIN" ? "rgba(185,28,28,0.7)" : "rgba(122,92,16,0.7)",
        "&:hover": {
          bgcolor:
            currentRole === "ADMIN"
              ? "rgba(185,28,28,0.06)"
              : "rgba(122,92,16,0.06)",
          borderColor: currentRole === "ADMIN" ? "error.main" : "primary.main",
        },
        "&.Mui-disabled": { opacity: 0.4 },
      }}
    >
      {loading ? "…" : currentRole === "ADMIN" ? "Remove admin" : "Make admin"}
    </MuiButton>
  );
}
