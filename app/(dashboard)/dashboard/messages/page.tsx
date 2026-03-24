import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MessageThread } from "@/components/messages/MessageThread";
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

  const threads = [...threadMap.entries()];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-light tracking-wide text-[var(--white)]">Messages</h1>
        <p className="text-xs text-[var(--white-dim)]/40 mt-1">
          {threads.length} conversation{threads.length !== 1 ? "s" : ""}
        </p>
      </div>

      {threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-4xl opacity-10">◇</p>
          <p className="text-[var(--white-dim)]">No messages yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {threads.map(([key, thread]) => {
            const [productId] = key.split(":");
            return (
              <div
                key={key}
                className="bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm overflow-hidden"
                style={{ minHeight: "280px" }}
              >
                <div className="px-4 py-2 bg-[var(--black-soft)] border-b border-[var(--black-border)] flex items-center gap-2">
                  <span className="text-xs text-[var(--white-dim)]/50">From:</span>
                  <span className="text-xs font-medium text-[var(--white)]">{thread.customerName}</span>
                </div>
                <MessageThread
                  messages={thread.messages}
                  currentUserId={adminId}
                  productId={productId}
                  recipientId={thread.customerId}
                  productName={thread.productName}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
