import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getHistoricalRate } from "@/lib/exchange-rate";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = req.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date param required (YYYY-MM-DD)" }, { status: 400 });
  }

  try {
    const { usdPerMxn, mxnPerUsd } = await getHistoricalRate(date);
    return NextResponse.json({ usdPerMxn, mxnPerUsd, date });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch rate" },
      { status: 502 }
    );
  }
}
