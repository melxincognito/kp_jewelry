"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MuiButton from "@mui/material/Button";
import Box from "@mui/material/Box";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <MuiButton
          onClick={handleDelete}
          disabled={loading}
          variant="text"
          size="small"
          sx={{
            fontSize: "0.75rem",
            textTransform: "none",
            letterSpacing: "normal",
            color: "error.main",
            p: 0,
            minWidth: 0,
            "&:hover": { color: "#dc2626", bgcolor: "transparent" },
            "&.Mui-disabled": { opacity: 0.5 },
          }}
        >
          {loading ? "…" : "Confirm"}
        </MuiButton>
        <MuiButton
          onClick={() => setConfirming(false)}
          variant="text"
          size="small"
          sx={{
            fontSize: "0.75rem",
            textTransform: "none",
            letterSpacing: "normal",
            color: "text.secondary",
            opacity: 0.4,
            p: 0,
            minWidth: 0,
            "&:hover": { opacity: 1, bgcolor: "transparent" },
          }}
        >
          Cancel
        </MuiButton>
      </Box>
    );
  }

  return (
    <MuiButton
      onClick={() => setConfirming(true)}
      variant="text"
      size="small"
      sx={{
        fontSize: "0.75rem",
        textTransform: "none",
        letterSpacing: "normal",
        color: "text.secondary",
        opacity: 0.3,
        p: 0,
        minWidth: 0,
        "&:hover": { color: "error.main", opacity: 1, bgcolor: "transparent" },
        transition: "all 0.15s",
      }}
    >
      Delete
    </MuiButton>
  );
}
