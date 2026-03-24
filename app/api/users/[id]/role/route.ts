import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Role } from "@/types/enums";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { role } = await req.json() as { role: Role };

  if (!["ADMIN", "CUSTOMER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Prevent removing your own admin role
  if (id === session.user.id && role !== "ADMIN") {
    return NextResponse.json(
      { error: "Cannot remove your own admin role" },
      { status: 400 }
    );
  }

  const user = await db.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json(user);
}
