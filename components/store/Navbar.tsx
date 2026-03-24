"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

interface NavbarProps {
  session: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 bg-[var(--black)]/90 backdrop-blur-md border-b border-[var(--black-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-[0.15em] text-gold-gradient">
              KP JEWLRS
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/shop" active={pathname.startsWith("/shop")}>
              Shop
            </NavLink>
            {session && (
              <NavLink href="/messages" active={pathname.startsWith("/messages")}>
                Messages
              </NavLink>
            )}
            {isAdmin && (
              <NavLink href="/dashboard" active={pathname.startsWith("/dashboard")}>
                Dashboard
              </NavLink>
            )}
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <span className="text-xs text-[var(--white-dim)]">
                  {session.user?.name ?? session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-xs text-[var(--white-dim)] hover:text-[var(--gold)] transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-[var(--white-dim)] hover:text-[var(--white)] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm px-4 py-2 border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)]/10 rounded-sm transition-colors"
                >
                  Create account
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[var(--white-dim)] hover:text-[var(--white)]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--black-border)] bg-[var(--black-soft)] px-4 py-4 flex flex-col gap-4">
          <Link href="/shop" className="text-sm text-[var(--white-dim)]" onClick={() => setMenuOpen(false)}>Shop</Link>
          {session && (
            <Link href="/messages" className="text-sm text-[var(--white-dim)]" onClick={() => setMenuOpen(false)}>Messages</Link>
          )}
          {isAdmin && (
            <Link href="/dashboard" className="text-sm text-[var(--white-dim)]" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          )}
          <hr className="divider-gold" />
          {session ? (
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-left text-[var(--white-dim)]">
              Sign out
            </button>
          ) : (
            <>
              <Link href="/login" className="text-sm text-[var(--white-dim)]" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link href="/register" className="text-sm text-[var(--gold)]" onClick={() => setMenuOpen(false)}>Create account</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "text-sm tracking-wide transition-colors duration-150",
        active
          ? "text-[var(--gold)] font-medium"
          : "text-[var(--white-dim)] hover:text-[var(--white)]",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
