import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { saleSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = saleSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const { productId, salePrice, buyerEmail, notes, soldAt } = result.data;

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.status === "SOLD" || product.quantity < 1) {
    return NextResponse.json({ error: "This item is out of stock" }, { status: 400 });
  }

  let buyerId: string | null = null;
  if (buyerEmail) {
    const buyer = await db.user.findUnique({
      where: { email: buyerEmail },
      select: { id: true },
    });
    buyerId = buyer?.id ?? null;
  }

  const newQuantity = product.quantity - 1;

  const sale = await db.$transaction(async (tx) => {
    const s = await tx.sale.create({
      data: {
        productId,
        buyerId,
        salePrice,
        notes,
        soldAt: new Date(soldAt),
      },
    });
    await tx.product.update({
      where: { id: productId },
      data: {
        quantity: newQuantity,
        // Only mark sold when the last unit is gone
        ...(newQuantity === 0 ? { status: "SOLD" } : {}),
      },
    });
    return s;
  });

  return NextResponse.json(sale, { status: 201 });
}
