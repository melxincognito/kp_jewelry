import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const adminId = session?.user?.id;

  const unreadCount = adminId
    ? await db.message.count({ where: { recipientId: adminId, read: false } })
    : 0;

  return (
    <div className="flex min-h-screen">
      <DashboardNav unreadCount={unreadCount} />
      <main className="flex-1 bg-[var(--black)] overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
