import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MessagesLayout } from "@/components/messages/MessagesLayout";
import type { ThreadData } from "@/components/messages/MessagesLayout";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages" };

type MsgRow = Awaited<ReturnType<typeof fetchMessages>>[number];

function fetchMessages(adminId: string) {
  return db.message.findMany({
    where: { OR: [{ senderId: adminId }, { recipientId: adminId }] },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, email: true } },
      recipient: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true } },
    },
  });
}

interface ThreadAccum {
  messages: MsgRow[];
  customerId: string;
  productName: string;
  customerName: string;
  deletedAt: Date | null;
}

function groupIntoThreads(
  messages: MsgRow[],
  adminId: string
): { inbox: ThreadData[]; deleted: ThreadData[] } {
  const map = new Map<string, ThreadAccum>();

  for (const msg of messages) {
    const customerId = msg.senderId === adminId ? msg.recipientId : msg.senderId;
    const key = `${msg.productId}:${customerId}`;

    if (!map.has(key)) {
      const customer = msg.senderId === adminId ? msg.recipient : msg.sender;
      map.set(key, {
        messages: [],
        customerId,
        productName: msg.product.name,
        customerName: customer.name ?? customer.email ?? "Customer",
        deletedAt: null,
      });
    }

    const entry = map.get(key)!;
    entry.messages.push(msg);

    // Track the deletion timestamp for this user's view (sender or recipient)
    const adminDeletedAt =
      msg.senderId === adminId ? msg.deletedBySenderAt : msg.deletedByRecipientAt;
    if (adminDeletedAt && !entry.deletedAt) {
      entry.deletedAt = adminDeletedAt;
    }
  }

  const inbox: ThreadData[] = [];
  const deleted: ThreadData[] = [];

  for (const [key, entry] of map.entries()) {
    const thread: ThreadData = {
      key,
      messages: entry.messages,
      recipientId: entry.customerId,
      productId: key.split(":")[0],
      productName: entry.productName,
      recipientName: entry.customerName,
      deletedAt: entry.deletedAt,
    };
    (entry.deletedAt ? deleted : inbox).push(thread);
  }

  return { inbox, deleted };
}

export default async function AdminMessagesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const adminId = session.user.id;

  // Only mark non-deleted inbox messages as read
  await db.message.updateMany({
    where: { recipientId: adminId, read: false, deletedByRecipientAt: null },
    data: { read: true },
  });

  const messages = await fetchMessages(adminId);
  const { inbox, deleted } = groupIntoThreads(messages, adminId);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-light tracking-wide text-[var(--white)]">Messages</h1>
      {inbox.length === 0 && deleted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-4xl opacity-10">◇</p>
          <p className="text-[var(--white-dim)]">No messages yet</p>
        </div>
      ) : (
        <MessagesLayout
          initialInboxThreads={inbox}
          initialDeletedThreads={deleted}
          currentUserId={adminId}
        />
      )}
    </div>
  );
}
