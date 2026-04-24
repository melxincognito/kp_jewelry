import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validations";
import { getHistoricalRate, mxnToUsd, toApiDate } from "@/lib/exchange-rate";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = productSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const data = result.data;

  let costUSD = data.costMXN;
  let exchangeRate = 1;

  try {
    const { usdPerMxn, mxnPerUsd } = await getHistoricalRate(toApiDate(data.purchaseDate));
    exchangeRate = mxnPerUsd;
    costUSD = mxnToUsd(data.costMXN, usdPerMxn);
  } catch {
    if (body.costUSD) costUSD = body.costUSD;
    if (body.exchangeRate) exchangeRate = body.exchangeRate;
  }

  if (data.sku) {
    const existing = await db.product.findFirst({ where: { sku: data.sku } });
    if (existing) {
      return NextResponse.json({ error: `SKU "${data.sku}" is already in use` }, { status: 400 });
    }
  }

  // If sizes are provided, quantity is their sum; otherwise use the submitted quantity
  const finalQuantity =
    data.sizes.length > 0
      ? data.sizes.reduce((sum, s) => sum + s.quantity, 0)
      : data.quantity;

  const product = await db.product.create({
    data: {
      name: data.name,
      sku: data.sku || null,
      description: data.description,
      material: data.material || null,
      images: JSON.stringify(body.images ?? []),
      costMXN: data.costMXN,
      costUSD: body.costUSD ?? costUSD,
      exchangeRate: body.exchangeRate ?? exchangeRate,
      purchaseDate: new Date(data.purchaseDate),
      shippingFees: data.shippingFees,
      wholesalePrice: data.wholesalePrice,
      sellingPrice: data.sellingPrice,
      jewelryType: data.jewelryType,
      styles: JSON.stringify(data.styles),
      quantity: finalQuantity,
      showOnStorefront: data.showOnStorefront,
      ...(data.sizes.length > 0 && {
        sizes: {
          create: data.sizes.map((s) => ({ size: s.size, quantity: s.quantity })),
        },
      }),
    },
  });

  return NextResponse.json(product, { status: 201 });
}
