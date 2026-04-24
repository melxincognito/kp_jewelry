import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MessagesLayout } from "@/components/messages/MessagesLayout";
import type { ThreadData } from "@/components/messages/MessagesLayout";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages" };

export default async function CustomerMessagesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  const [messages, admin] = await Promise.all([
    db.message.findMany({
      where: { OR: [{ senderId: userId }, { recipientId: userId }] },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true } },
      },
    }),
    db.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const adminId = admin?.id ?? "";
  const adminName = admin?.name ?? admin?.email ?? "KP Jewelers";

  // Group by productId, split into inbox vs deleted
  const map = new Map<
    string,
    { messages: typeof messages; deletedAt: Date | null }
  >();

  for (const msg of messages) {
    if (!map.has(msg.productId)) {
      map.set(msg.productId, { messages: [], deletedAt: null });
    }
    const entry = map.get(msg.productId)!;
    entry.messages.push(msg);

    const userDeletedAt =
      msg.senderId === userId ? msg.deletedBySenderAt : msg.deletedByRecipientAt;
    if (userDeletedAt && !entry.deletedAt) {
      entry.deletedAt = userDeletedAt;
    }
  }

  const inbox: ThreadData[] = [];
  const deleted: ThreadData[] = [];

  for (const [productId, entry] of map.entries()) {
    const thread: ThreadData = {
      key: productId,
      messages: entry.messages,
      recipientId: adminId,
      productId,
      productName: entry.messages[0].product.name,
      recipientName: adminName,
      deletedAt: entry.deletedAt,
    };
    (entry.deletedAt ? deleted : inbox).push(thread);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-4">
      <h1 className="text-xl font-light tracking-wide text-[var(--white)]">Messages</h1>
      {inbox.length === 0 && deleted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-4xl opacity-10">◇</p>
          <p className="text-[var(--white-dim)]">No messages yet</p>
          <p className="text-xs text-[var(--white-dim)]/40">
            Browse the shop and message us about an item
          </p>
        </div>
      ) : (
        <MessagesLayout
          initialInboxThreads={inbox}
          initialDeletedThreads={deleted}
          currentUserId={userId}
        />
      )}
    </div>
  );
}
