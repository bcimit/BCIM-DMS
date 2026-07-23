import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DocumentStatus, RfiStatus, SubmittalStatus } from "@/generated/prisma/client";

export type ApprovalQueueItem = {
  id: string;
  kind: "document" | "rfi" | "submittal";
  title: string;
  subtitle: string;
  status: string;
  createdAt: string;
  href: string;
};

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const [documents, rfis, submittals] = await Promise.all([
    prisma.document.findMany({
      where: {
        projectId,
        deletedAt: null,
        status: { in: [DocumentStatus.SUBMITTED, DocumentStatus.UNDER_REVIEW] },
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, documentNo: true, status: true, createdAt: true },
    }),
    prisma.rfi.findMany({
      where: { projectId, status: RfiStatus.OPEN },
      orderBy: { createdAt: "desc" },
      select: { id: true, subject: true, rfiNo: true, status: true, createdAt: true },
    }),
    prisma.submittal.findMany({
      where: { projectId, status: { in: [SubmittalStatus.SUBMITTED, SubmittalStatus.UNDER_REVIEW] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, subject: true, submittalNo: true, status: true, createdAt: true },
    }),
  ]);

  const items: ApprovalQueueItem[] = [
    ...documents.map((d) => ({
      id: d.id,
      kind: "document" as const,
      title: d.name,
      subtitle: d.documentNo,
      status: d.status,
      createdAt: d.createdAt.toISOString(),
      href: `/documents?project=${projectId}`,
    })),
    ...rfis.map((r) => ({
      id: r.id,
      kind: "rfi" as const,
      title: r.subject,
      subtitle: r.rfiNo,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      href: `/rfi?project=${projectId}`,
    })),
    ...submittals.map((s) => ({
      id: s.id,
      kind: "submittal" as const,
      title: s.subject,
      subtitle: s.submittalNo,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      href: `/submittals?project=${projectId}`,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ data: items });
}
