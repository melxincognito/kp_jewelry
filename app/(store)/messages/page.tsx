import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MessageThread } from "@/components/messages/MessageThread";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages" };

export default async function CustomerMessagesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  // Get all message threads the customer is part of, grouped by product
  const messages = await db.message.findMany({
    where: {
      OR: [{ senderId: userId }, { recipientId: userId }],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, email: true } },
      recipient: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true } },
    },
  });

  // Group by productId
  const threadMap = new Map<string, typeof messages>();
  for (const msg of messages) {
    if (!threadMap.has(msg.productId)) threadMap.set(msg.productId, []);
    threadMap.get(msg.productId)!.push(msg);
  }
  const threads = [...threadMap.entries()];

  // Find admin to reply to
  const admin = await db.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-xl font-light tracking-wide text-[var(--white)] mb-6">Messages</h1>

      {threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-4xl opacity-10">◇</p>
          <p className="text-[var(--white-dim)]">No messages yet</p>
          <p className="text-xs text-[var(--white-dim)]/40">
            Browse the shop and message the seller about an item
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {threads.map(([productId, msgs]) => (
            <div
              key={productId}
              className="bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm overflow-hidden"
              style={{ minHeight: "300px" }}
            >
              <MessageThread
                messages={msgs}
                currentUserId={userId}
                productId={productId}
                recipientId={admin?.id ?? ""}
                productName={msgs[0].product.name}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
