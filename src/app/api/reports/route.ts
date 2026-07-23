import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const [byDiscipline, byType] = await Promise.all([
    prisma.document.groupBy({ by: ["discipline"], where: { projectId }, _count: { _all: true } }),
    prisma.document.groupBy({ by: ["type"], where: { projectId }, _count: { _all: true } }),
  ]);

  return NextResponse.json({
    byDiscipline: byDiscipline
      .map((d) => ({ discipline: d.discipline, count: d._count._all }))
      .sort((a, b) => b.count - a.count),
    byType: byType
      .map((t) => ({ type: t.type, count: t._count._all }))
      .sort((a, b) => b.count - a.count),
  });
}
