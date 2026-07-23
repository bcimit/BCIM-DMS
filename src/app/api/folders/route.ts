import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function buildBreadcrumb(folderId: string | null) {
  const chain: { id: string; name: string }[] = [];
  let currentId = folderId;
  while (currentId) {
    const folder: { id: string; name: string; parentId: string | null } | null =
      await prisma.folder.findUnique({
        where: { id: currentId },
        select: { id: true, name: true, parentId: true },
      });
    if (!folder) break;
    chain.unshift({ id: folder.id, name: folder.name });
    currentId = folder.parentId;
  }
  return chain;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const projectId = sp.get("projectId");
  const folderId = sp.get("folderId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const [project, children, breadcrumb, documentCount] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId }, select: { id: true, name: true } }),
    prisma.folder.findMany({
      where: { projectId, parentId: folderId ?? null },
      orderBy: { name: "asc" },
      include: { _count: { select: { documents: true, children: true } } },
    }),
    buildBreadcrumb(folderId),
    folderId ? prisma.document.count({ where: { folderId } }) : Promise.resolve(0),
  ]);

  return NextResponse.json({ project, children, breadcrumb, documentCount });
}
