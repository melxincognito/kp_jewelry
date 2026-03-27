"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
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

    // Auto sign in after registration
    await signIn("credentials", { email, password, callbackUrl: "/" });
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--black)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-semibold tracking-[0.15em] text-gold-gradient">
            KP JEWLRS
          </Link>
          <p className="text-sm text-[var(--white-dim)] mt-2">Create your account</p>
        </div>

        <div className="bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm p-6">
          {error && (
            <div role="alert" aria-live="assertive" className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-sm text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} aria-label="Create account" className="flex flex-col gap-4">
            <Input name="name" label="Full Name" type="text" autoComplete="name" required />
            <Input name="email" label="Email" type="email" autoComplete="email" required />
            <Input
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              hint="Minimum 8 characters"
              required
              minLength={8}
            />
            <Input
              name="confirm"
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              required
            />
            <Button type="submit" loading={loading} className="w-full mt-2">
              Create account
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <hr className="flex-1 border-[var(--black-border)]" />
            <span className="text-xs text-[var(--white-dim)]/40">or</span>
            <hr className="flex-1 border-[var(--black-border)]" />
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full mt-4"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Continue with Google
          </Button>
        </div>

        <p className="text-center text-xs text-[var(--white-dim)]/50 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--gold)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
