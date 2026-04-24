import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ── GET /api/messages/cleanup ────────────────────────────────────────────────
// Permanently deletes messages that BOTH parties have soft-deleted for 30+ days.
// Call this on a daily cron:
//   Authorization: Bearer <HEALTH_API_KEY>
//   or ?key=<HEALTH_API_KEY>
// ─────────────────────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const apiKey = process.env.HEALTH_API_KEY;
  if (!apiKey) return false;
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7) === apiKey;
  return req.nextUrl.searchParams.get("key") === apiKey;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

  // Permanently delete messages where both parties deleted their copy 30+ days ago
  const { count } = await db.message.deleteMany({
    where: {
      deletedBySenderAt: { not: null, lt: cutoff },
      deletedByRecipientAt: { not: null, lt: cutoff },
    },
  });

  return NextResponse.json({
    ok: true,
    permanentlyDeleted: count,
    cutoff: cutoff.toISOString(),
  });
}
