"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "◈" },
  { href: "/dashboard/inventory", label: "Inventory", icon: "◻" },
  { href: "/dashboard/sales", label: "Sales", icon: "◆" },
  { href: "/dashboard/messages", label: "Messages", icon: "◇" },
  { href: "/dashboard/users", label: "Users", icon: "◉" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard navigation"
      className="w-52 flex-shrink-0 flex flex-col bg-[var(--black-soft)] border-r border-[var(--black-border)] min-h-screen sticky top-0"
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[var(--black-border)]">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.15em] text-gold-gradient"
        >
          KP JEWELRS
        </Link>
        <p className="text-[10px] text-[var(--white-dim)]/40 mt-0.5 tracking-widest uppercase">
          Dashboard
        </p>
      </div>

      {/* Nav links */}
      <div className="flex-1 py-4 flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors",
                isActive
                  ? "bg-[var(--gold)]/10 text-[var(--gold)] font-medium"
                  : "text-[var(--white-dim)] hover:text-[var(--white)] hover:bg-white/5",
              ].join(" ")}
            >
              <span aria-hidden="true" className="text-xs opacity-70">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[var(--black-border)]">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="text-xs text-[var(--white-dim)]/50 hover:text-[var(--white-dim)] transition-colors"
          >
            <span aria-hidden="true">← </span>View Store
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs text-left text-[var(--white-dim)]/50 hover:text-[var(--white-dim)] transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
