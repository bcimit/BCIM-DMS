import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RfiStatus } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const now = new Date();

  const [total, open, answered, closed, overdue] = await Promise.all([
    prisma.rfi.count({ where: { projectId } }),
    prisma.rfi.count({ where: { projectId, status: RfiStatus.OPEN } }),
    prisma.rfi.count({ where: { projectId, status: RfiStatus.ANSWERED } }),
    prisma.rfi.count({ where: { projectId, status: RfiStatus.CLOSED } }),
    prisma.rfi.count({
      where: { projectId, status: { in: [RfiStatus.OPEN, RfiStatus.ANSWERED] }, dueDate: { lt: now } },
    }),
  ]);

  return NextResponse.json({ total, open, answered, closed, overdue });
}
