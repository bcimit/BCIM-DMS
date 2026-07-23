import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDriveQuota } from "@/lib/graph";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const quota = await getDriveQuota();
    return NextResponse.json(quota);
  } catch (e) {
    console.error("Failed to fetch SharePoint storage quota:", e);
    return NextResponse.json({ error: "Failed to fetch storage quota" }, { status: 502 });
  }
}
