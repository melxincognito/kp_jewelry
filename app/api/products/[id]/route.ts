import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validations";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const result = productSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const data = result.data;
  if (data.sku) {
    const existing = await db.product.findFirst({ where: { sku: data.sku, NOT: { id } } });
    if (existing) {
      return NextResponse.json({ error: `SKU "${data.sku}" is already in use` }, { status: 400 });
    }
  }

  const product = await db.product.update({
    where: { id },
    data: {
      name: data.name,
      sku: data.sku || null,
      description: data.description,
      images: JSON.stringify(body.images ?? []),
      costMXN: data.costMXN,
      costUSD: body.costUSD,
      exchangeRate: body.exchangeRate,
      purchaseDate: new Date(data.purchaseDate),
      shippingFees: data.shippingFees,
      wholesalePrice: data.wholesalePrice,
      sellingPrice: data.sellingPrice,
      jewelryType: data.jewelryType,
      styles: JSON.stringify(data.styles),
      quantity: data.quantity,
      status: body.status,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
