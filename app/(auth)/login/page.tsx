"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--black)]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-semibold tracking-[0.15em] text-gold-gradient">
            KP JEWLRS
          </Link>
          <p className="text-sm text-[var(--white-dim)] mt-2">Sign in to your account</p>
        </div>

        <div className="bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm p-6">
          {error && (
            <div role="alert" aria-live="assertive" className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-sm text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} aria-label="Sign in" className="flex flex-col gap-4">
            <Input name="email" label="Email" type="email" autoComplete="email" required />
            <Input
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              required
            />
            <Button type="submit" loading={loading} className="w-full mt-2">
              Sign in
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
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[var(--gold)] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
