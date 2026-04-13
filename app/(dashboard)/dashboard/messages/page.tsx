import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MessagesLayout } from "@/components/messages/MessagesLayout";
import type { ThreadData } from "@/components/messages/MessagesLayout";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const adminId = session.user.id;

  // Mark messages as read
  await db.message.updateMany({
    where: { recipientId: adminId, read: false },
    data: { read: true },
  });

  const messages = await db.message.findMany({
    where: {
      OR: [{ senderId: adminId }, { recipientId: adminId }],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, email: true } },
      recipient: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true } },
    },
  });

  // Group by [productId + customer] — key = productId:customerId
  const threadMap = new Map<string, { messages: typeof messages; customerId: string; productName: string; customerName: string }>();

  for (const msg of messages) {
    const customerId = msg.senderId === adminId ? msg.recipientId : msg.senderId;
    const key = `${msg.productId}:${customerId}`;
    if (!threadMap.has(key)) {
      const customer = msg.senderId === adminId ? msg.recipient : msg.sender;
      threadMap.set(key, {
        messages: [],
        customerId,
        productName: msg.product.name,
        customerName: customer.name ?? customer.email ?? "Customer",
      });
    }
    threadMap.get(key)!.messages.push(msg);
  }

  const threadData: ThreadData[] = [...threadMap.entries()].map(([key, thread]) => {
    const [productId] = key.split(":");
    return {
      key,
      messages: thread.messages,
      recipientId: thread.customerId,
      productId,
      productName: thread.productName,
      recipientName: thread.customerName,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-light tracking-wide text-[var(--white)]">Messages</h1>
      {threadData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-4xl opacity-10">◇</p>
          <p className="text-[var(--white-dim)]">No messages yet</p>
        </div>
      ) : (
        <MessagesLayout initialThreads={threadData} currentUserId={adminId} />
      )}
    </div>
  );
}
