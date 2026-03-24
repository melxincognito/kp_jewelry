import { db } from "@/lib/db";
import { UserRoleToggle } from "@/components/dashboard/UserRoleToggle";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const users = await db.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { purchases: true, sentMessages: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-light tracking-wide text-[var(--white)]">Users</h1>
        <p className="text-xs text-[var(--white-dim)]/40 mt-1">
          {users.length} registered accounts
        </p>
      </div>

      <div className="bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--black-border)]">
              <th className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Name</th>
              <th className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Role</th>
              <th className="text-right px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Purchases</th>
              <th className="text-right px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Messages</th>
              <th className="text-right px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[var(--black-border)]/50 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3 text-[var(--white)]">
                  {user.name ?? <span className="text-[var(--white-dim)]/30 italic text-xs">No name</span>}
                </td>
                <td className="px-4 py-3 text-[var(--white-dim)] text-xs">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      "text-xs font-medium px-2 py-0.5 rounded-sm",
                      user.role === "ADMIN"
                        ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                        : "bg-white/5 text-[var(--white-dim)]",
                    ].join(" ")}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-[var(--white-dim)]">
                  {user._count.purchases}
                </td>
                <td className="px-4 py-3 text-right text-[var(--white-dim)]">
                  {user._count.sentMessages}
                </td>
                <td className="px-4 py-3 text-right text-xs text-[var(--white-dim)]/40">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <UserRoleToggle userId={user.id} currentRole={user.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
