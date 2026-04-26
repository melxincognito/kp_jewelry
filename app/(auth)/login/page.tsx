"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: 2, bgcolor: "background.default" }}>
      <Box sx={{ width: "100%", maxWidth: 384 }}>
        {/* Logo */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <MuiLink href="/" className="text-gold-gradient" sx={{ fontSize: "1.25rem", fontWeight: 600, letterSpacing: "0.15em", textDecoration: "none" }}>
            KP JEWELRS
          </MuiLink>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }} aria-label="Sign in to your account">
            Sign in to your account
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" role="alert" aria-live="assertive" sx={{ mb: 2, fontSize: "0.75rem" }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} aria-label="Sign in" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Input name="email" label="Email" type="email" autoComplete="email" required />
            <Input name="password" label="Password" type="password" autoComplete="current-password" required />
            <Button type="submit" loading={loading} fullWidth>
              Sign in
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
          Don&apos;t have an account?{" "}
          <MuiLink href="/register" sx={{ color: "primary.main" }} aria-label="Don't have an account? Create one.">
            Create one
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}
