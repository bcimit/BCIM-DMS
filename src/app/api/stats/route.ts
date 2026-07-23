import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DocumentStatus, DocumentType } from "@/generated/prisma/client";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId") ?? undefined;
  const monthStart = startOfMonth();
  const base = projectId ? { projectId } : {};

  const [
    totalDocuments,
    totalFolders,
    totalDrawings,
    totalRfis,
    totalSubmittals,
    totalApproved,
    docsThisMonth,
    foldersThisMonth,
    drawingsThisMonth,
    rfisThisMonth,
    submittalsThisMonth,
    statusGroups,
    documents,
  ] = await Promise.all([
    prisma.document.count({ where: base }),
    prisma.folder.count({ where: projectId ? { projectId } : {} }),
    prisma.document.count({ where: { ...base, type: { in: [DocumentType.DRAWING, DocumentType.CAD_DRAWING] } } }),
    prisma.document.count({ where: { ...base, type: DocumentType.RFI } }),
    prisma.document.count({ where: { ...base, type: DocumentType.SUBMITTAL } }),
    prisma.document.count({ where: { ...base, status: DocumentStatus.APPROVED } }),
    prisma.document.count({ where: { ...base, createdAt: { gte: monthStart } } }),
    prisma.folder.count({ where: { ...(projectId ? { projectId } : {}), createdAt: { gte: monthStart } } }),
    prisma.document.count({
      where: { ...base, type: { in: [DocumentType.DRAWING, DocumentType.CAD_DRAWING] }, createdAt: { gte: monthStart } },
    }),
    prisma.document.count({ where: { ...base, type: DocumentType.RFI, createdAt: { gte: monthStart } } }),
    prisma.document.count({ where: { ...base, type: DocumentType.SUBMITTAL, createdAt: { gte: monthStart } } }),
    prisma.document.groupBy({ by: ["status"], where: base, _count: { _all: true } }),
    prisma.document.findMany({
      where: base,
      select: { createdAt: true, status: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const trendMap = new Map<string, { uploaded: number; approved: number }>();
  for (const doc of documents) {
    const key = doc.createdAt.toISOString().slice(0, 10);
    const entry = trendMap.get(key) ?? { uploaded: 0, approved: 0 };
    entry.uploaded += 1;
    if (doc.status === DocumentStatus.APPROVED) entry.approved += 1;
    trendMap.set(key, entry);
  }
  const trend = Array.from(trendMap.entries())
    .map(([date, v]) => ({ date, ...v }))
    .slice(-30);

  return NextResponse.json({
    totals: {
      documents: totalDocuments,
      folders: totalFolders,
      drawings: totalDrawings,
      rfis: totalRfis,
      submittals: totalSubmittals,
      approved: totalApproved,
    },
    monthDelta: {
      documents: docsThisMonth,
      folders: foldersThisMonth,
      drawings: drawingsThisMonth,
      rfis: rfisThisMonth,
      submittals: submittalsThisMonth,
    },
    statusBreakdown: statusGroups.map((g) => ({ status: g.status, count: g._count._all })),
    trend,
  });
}
