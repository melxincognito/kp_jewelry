"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MuiButton from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

interface SendMessageFormProps {
  productId: string;
  recipientId: string;
}

export function SendMessageForm({ productId, recipientId }: SendMessageFormProps) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, recipientId, body }),
    });

    setLoading(false);
    if (res.ok) {
      setSent(true);
      setBody("");
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to send message.");
    }
  }

  if (sent) {
    return (
      <Box
        role="status"
        aria-live="polite"
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: "rgba(5,150,105,0.08)",
          border: "1px solid rgba(5,150,105,0.2)",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography variant="body2" sx={{ color: "#059669" }}>
          Message sent! The seller will get back to you soon.
        </Typography>
        <MuiButton
          variant="text"
          size="small"
          onClick={() => setSent(false)}
          sx={{ color: "#059669", opacity: 0.7, textTransform: "none", letterSpacing: "normal", fontSize: "0.75rem", p: 0, minWidth: 0, ml: 0.5 }}
        >
          Send another
        </MuiButton>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {error && (
        <Alert severity="error" sx={{ fontSize: "0.75rem" }} role="alert">{error}</Alert>
      )}
      <TextField
        label="Message to seller"
        placeholder="I'm interested in this item. Is it still available?"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        multiline
        rows={3}
        fullWidth
        size="small"
      />
      <MuiButton
        type="submit"
        variant="contained"
        size="small"
        disabled={!body.trim() || loading}
        startIcon={loading ? <CircularProgress size={12} sx={{ color: "inherit" }} /> : undefined}
        sx={{
          alignSelf: "flex-start",
          bgcolor: "#1a1714",
          color: "#fdfbf8",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontSize: "0.7rem",
          "&:hover": { bgcolor: "#7a5c10" },
          "&.Mui-disabled": { opacity: 0.5 },
        }}
      >
        Send Message
      </MuiButton>
    </Box>
  );
}
