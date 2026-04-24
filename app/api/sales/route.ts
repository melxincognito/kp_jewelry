import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const saleSchema = z.object({
  productId: z.string().min(1),
  size: z.string().optional(),
  salePrice: z.coerce.number().positive("Sale price must be positive"),
  buyerEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
  soldAt: z.string().min(1, "Sale date is required"),
});

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

  const { productId, size, salePrice, buyerEmail, notes, soldAt } = result.data;

  const product = await db.product.findUnique({
    where: { id: productId },
    include: { sizes: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.status === "SOLD" || product.quantity < 1) {
    return NextResponse.json({ error: "This item is out of stock" }, { status: 400 });
  }

  // If a size is specified, validate and decrement it
  if (size) {
    const sizeRow = product.sizes.find((s) => s.size === size);
    if (!sizeRow) {
      return NextResponse.json({ error: `Size "${size}" not found for this product` }, { status: 400 });
    }
    if (sizeRow.quantity < 1) {
      return NextResponse.json({ error: `Size "${size}" is out of stock` }, { status: 400 });
    }
  } else if (product.sizes.length > 0) {
    // Product has sizes but none was selected
    return NextResponse.json({ error: "Please select a size for this item" }, { status: 400 });
  }

  let buyerId: string | null = null;
  if (buyerEmail) {
    const buyer = await db.user.findUnique({ where: { email: buyerEmail }, select: { id: true } });
    buyerId = buyer?.id ?? null;
  }

  const newQuantity = product.quantity - 1;

  const sale = await db.$transaction(async (tx) => {
    // Decrement size stock if applicable
    if (size) {
      await tx.productSize.updateMany({
        where: { productId, size },
        data: { quantity: { decrement: 1 } },
      });
    }

    // Decrement total product quantity; mark SOLD when last unit is gone
    await tx.product.update({
      where: { id: productId },
      data: {
        quantity: newQuantity,
        ...(newQuantity === 0 ? { status: "SOLD" } : {}),
      },
    });

    return tx.sale.create({
      data: { productId, buyerId, salePrice, size: size ?? null, notes, soldAt: new Date(soldAt) },
    });
  });

  return NextResponse.json(sale, { status: 201 });
}
