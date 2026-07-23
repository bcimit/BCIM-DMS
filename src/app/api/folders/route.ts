import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notifyAdmins } from "@/lib/notify";

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
  const all = sp.get("all") === "true";

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  if (all) {
    const folders = await prisma.folder.findMany({
      where: { projectId },
      orderBy: { path: "asc" },
      select: { id: true, name: true, path: true },
    });
    return NextResponse.json({ data: folders });
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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, parentId, name } = body as {
    projectId?: string;
    parentId?: string | null;
    name?: string;
  };

  if (!projectId || !name?.trim()) {
    return NextResponse.json({ error: "projectId and name are required" }, { status: 400 });
  }

  const parent = parentId
    ? await prisma.folder.findUnique({ where: { id: parentId }, select: { path: true } })
    : null;

  if (parentId && !parent) {
    return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
  }

  const trimmedName = name.trim();
  const path = parent ? `${parent.path}/${trimmedName}` : `/${trimmedName}`;

  const existing = await prisma.folder.findFirst({
    where: { projectId, parentId: parentId ?? null, name: trimmedName },
  });
  if (existing) {
    return NextResponse.json({ error: "A folder with this name already exists here" }, { status: 409 });
  }

  const folder = await prisma.folder.create({
    data: { projectId, parentId: parentId ?? null, name: trimmedName, path },
  });

  await notifyAdmins(
    "New folder created",
    `${session.user.name} created folder <strong>${path}</strong>.`,
    `/documents?project=${projectId}`
  );

  return NextResponse.json({ data: folder });
}
