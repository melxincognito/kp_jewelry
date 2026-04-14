import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  const unreadCount = userId
    ? await db.message.count({ where: { recipientId: userId, read: false } })
    : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar session={session} unreadCount={unreadCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
