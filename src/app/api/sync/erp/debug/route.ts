import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [syncStates, project] = await Promise.all([
    prisma.integrationSyncState.findMany(),
    prisma.project.findUnique({ where: { code: "DQSTWR001" } }),
  ]);

  return NextResponse.json({ data: { syncStates, dqstwr001Exists: !!project } });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  await prisma.integrationSyncState.deleteMany();
  return NextResponse.json({ data: { cleared: true } });
}
