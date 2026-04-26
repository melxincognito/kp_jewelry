"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Registration failed.");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, callbackUrl: "/" });
    router.refresh();
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: 2, bgcolor: "background.default" }}>
      <Box sx={{ width: "100%", maxWidth: 384 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <MuiLink href="/" className="text-gold-gradient" sx={{ fontSize: "1.25rem", fontWeight: 600, letterSpacing: "0.15em", textDecoration: "none" }}>
            KP JEWELRS
          </MuiLink>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
            Create your account
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" role="alert" aria-live="assertive" sx={{ mb: 2, fontSize: "0.75rem" }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} aria-label="Create account" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Input name="name" label="Full Name" type="text" autoComplete="name" required />
            <Input name="email" label="Email" type="email" autoComplete="email" required />
            <Input name="password" label="Password" type="password" autoComplete="new-password" hint="Minimum 8 characters" required minLength={8} />
            <Input name="confirm" label="Confirm Password" type="password" autoComplete="new-password" required />
            <Button type="submit" loading={loading} fullWidth>
              Create account
            </Button>
          </Box>

          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box component="hr" sx={{ flex: 1, border: "none", borderTop: "1px solid", borderColor: "divider" }} />
            <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4 }}>or</Typography>
            <Box component="hr" sx={{ flex: 1, border: "none", borderTop: "1px solid", borderColor: "divider" }} />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button type="button" variant="secondary" fullWidth onClick={() => signIn("google", { callbackUrl: "/" })}>
              Continue with Google
            </Button>
          </Box>
        </Paper>

        <Typography variant="caption" sx={{ display: "block", textAlign: "center", color: "text.secondary", opacity: 0.5, mt: 2 }}>
          Already have an account?{" "}
          <MuiLink href="/login" sx={{ color: "primary.main" }}>
            Sign in
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}
