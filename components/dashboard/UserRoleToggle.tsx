"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <button
      onClick={toggle}
      disabled={loading}
      className={[
        "text-xs px-2.5 py-1 rounded-sm border transition-colors disabled:opacity-40",
        currentRole === "ADMIN"
          ? "border-red-500/30 text-red-400/70 hover:bg-red-500/10"
          : "border-[var(--gold)]/30 text-[var(--gold)]/70 hover:bg-[var(--gold)]/10",
      ].join(" ")}
    >
      {loading ? "..." : currentRole === "ADMIN" ? "Remove admin" : "Make admin"}
    </button>
  );
}
