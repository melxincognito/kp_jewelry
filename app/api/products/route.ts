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

  // If costUSD was not provided (or is 0), calculate from MXN + rate
  let costUSD = data.costMXN; // fallback
  let exchangeRate = 1;

  try {
    const { usdPerMxn, mxnPerUsd } = await getHistoricalRate(
      toApiDate(data.purchaseDate)
    );
    exchangeRate = mxnPerUsd;
    costUSD = mxnToUsd(data.costMXN, usdPerMxn);
  } catch {
    // If rate fetch fails, use what the client sent
    if (body.costUSD) costUSD = body.costUSD;
    if (body.exchangeRate) exchangeRate = body.exchangeRate;
  }

  const product = await db.product.create({
    data: {
      name: data.name,
      description: data.description,
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
      quantity: data.quantity,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
