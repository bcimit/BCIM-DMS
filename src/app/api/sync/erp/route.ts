import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { runErpSync } from "@/lib/erp-sync";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const states = await prisma.integrationSyncState.findMany();
  const byKey = Object.fromEntries(states.map((s) => [s.key, s.lastSyncedAt]));

  return NextResponse.json({
    data: {
      enabled: !!process.env.ERP_API_KEY,
      endpoints: {
        "work-orders": { lastSyncedAt: byKey["work-orders"] ?? null },
        "purchase-orders": { lastSyncedAt: byKey["purchase-orders"] ?? null },
        mrs: { lastSyncedAt: byKey["mrs"] ?? null },
      },
    },
  });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const result = await runErpSync();
    return NextResponse.json({ data: result });
  } catch (e) {
    console.error("Manual ERP sync failed:", e);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
