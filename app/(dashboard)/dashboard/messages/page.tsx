import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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

function groupIntoThreads(messages: MsgRow[], adminId: string): { inbox: ThreadData[]; deleted: ThreadData[] } {
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

    const adminDeletedAt = msg.senderId === adminId ? msg.deletedBySenderAt : msg.deletedByRecipientAt;
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

  await db.message.updateMany({
    where: { recipientId: adminId, read: false, deletedByRecipientAt: null },
    data: { read: true },
  });

  const messages = await fetchMessages(adminId);
  const { inbox, deleted } = groupIntoThreads(messages, adminId);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 300, letterSpacing: "0.05em", color: "text.primary" }}>
        Messages
      </Typography>
      {inbox.length === 0 && deleted.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 12, gap: 1.5, textAlign: "center" }}>
          <Typography sx={{ fontSize: "2.5rem", opacity: 0.1 }} aria-hidden="true">◇</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>No messages yet</Typography>
        </Box>
      ) : (
        <MessagesLayout initialInboxThreads={inbox} initialDeletedThreads={deleted} currentUserId={adminId} />
      )}
    </Box>
  );
}
