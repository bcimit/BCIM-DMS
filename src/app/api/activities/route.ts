import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId") ?? undefined;
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "8");

  const activities = await prisma.activity.findMany({
    where: projectId ? { document: { projectId } } : {},
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { name: true, avatarUrl: true } },
      document: { select: { name: true } },
    },
  });

  return NextResponse.json({ data: activities });
}
