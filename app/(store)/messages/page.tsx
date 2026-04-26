import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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
    db.user.findFirst({ where: { role: "ADMIN" }, select: { id: true, name: true, email: true } }),
  ]);

  const adminId = admin?.id ?? "";
  const adminName = admin?.name ?? admin?.email ?? "KP Jewelers";

  const map = new Map<string, { messages: typeof messages; deletedAt: Date | null }>();

  for (const msg of messages) {
    if (!map.has(msg.productId)) {
      map.set(msg.productId, { messages: [], deletedAt: null });
    }
    const entry = map.get(msg.productId)!;
    entry.messages.push(msg);

    const userDeletedAt = msg.senderId === userId ? msg.deletedBySenderAt : msg.deletedByRecipientAt;
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
    <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 2, sm: 3, lg: 4 }, py: 5, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 300, letterSpacing: "0.05em", color: "text.primary" }}>
        Messages
      </Typography>
      {inbox.length === 0 && deleted.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 12, gap: 1.5, textAlign: "center" }}>
          <Typography sx={{ fontSize: "2.5rem", opacity: 0.1 }} aria-hidden="true">◇</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>No messages yet</Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4 }}>
            Browse the shop and message us about an item
          </Typography>
        </Box>
      ) : (
        <MessagesLayout initialInboxThreads={inbox} initialDeletedThreads={deleted} currentUserId={userId} />
      )}
    </Box>
  );
}
