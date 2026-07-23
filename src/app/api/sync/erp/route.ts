import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminRole } from "@/lib/permissions";
import { runErpSync } from "@/lib/erp-sync";

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
