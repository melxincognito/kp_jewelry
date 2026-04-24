import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({
  productId: z.string().min(1),
  otherId: z.string().min(1),
});

// ── DELETE /api/messages/threads ── soft-delete a thread for the current user
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { productId, otherId } = parsed.data;
  const userId = session.user.id;
  const now = new Date();

  // Mark messages where the current user is the sender
  await db.message.updateMany({
    where: {
      productId,
      senderId: userId,
      recipientId: otherId,
      deletedBySenderAt: null,
    },
    data: { deletedBySenderAt: now },
  });

  // Mark messages where the current user is the recipient
  await db.message.updateMany({
    where: {
      productId,
      recipientId: userId,
      senderId: otherId,
      deletedByRecipientAt: null,
    },
    data: { deletedByRecipientAt: now },
  });

  return NextResponse.json({ ok: true });
}

// ── PATCH /api/messages/threads ── restore a soft-deleted thread
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { productId, otherId } = parsed.data;
  const userId = session.user.id;

  await db.message.updateMany({
    where: { productId, senderId: userId, recipientId: otherId },
    data: { deletedBySenderAt: null },
  });

  await db.message.updateMany({
    where: { productId, recipientId: userId, senderId: otherId },
    data: { deletedByRecipientAt: null },
  });

  return NextResponse.json({ ok: true });
}
