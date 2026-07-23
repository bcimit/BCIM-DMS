import { prisma } from "@/lib/prisma";
import { DocumentStatus } from "@/generated/prisma/client";
import type { ProjectSummary } from "@/types/document";

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { documents: true, folders: true } } },
  });

  return Promise.all(
    projects.map(async (project) => {
      const [approved, pending, lastDocument] = await Promise.all([
        prisma.document.count({ where: { projectId: project.id, status: DocumentStatus.APPROVED } }),
        prisma.document.count({
          where: { projectId: project.id, status: { in: [DocumentStatus.SUBMITTED, DocumentStatus.UNDER_REVIEW] } },
        }),
        prisma.document.findFirst({
          where: { projectId: project.id },
          orderBy: { updatedAt: "desc" },
          select: { updatedAt: true },
        }),
      ]);

      return {
        id: project.id,
        name: project.name,
        code: project.code,
        location: project.location,
        documentCount: project._count.documents,
        folderCount: project._count.folders,
        approvedCount: approved,
        pendingCount: pending,
        lastActivityAt: (lastDocument?.updatedAt ?? project.createdAt).toISOString(),
      };
    })
  );
}
