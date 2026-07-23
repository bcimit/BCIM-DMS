import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/permissions";
import { DocumentStatus } from "@/generated/prisma/client";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      uploadedBy: { select: { id: true, name: true, avatarUrl: true } },
      category: { select: { name: true } },
      folder: { select: { id: true, name: true, path: true } },
      project: { select: { id: true, name: true } },
      versions: { orderBy: { createdAt: "desc" } },
      approvals: { orderBy: { createdAt: "desc" }, include: { actor: { select: { name: true } } } },
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({ data: document });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, description, discipline, type, building, floor, folderId, status } = body as {
    name?: string;
    description?: string | null;
    discipline?: string;
    type?: string;
    building?: string | null;
    floor?: string | null;
    folderId?: string | null;
    status?: string;
  };

  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (folderId !== undefined && folderId !== null) {
    const folder = await prisma.folder.findFirst({ where: { id: folderId, projectId: document.projectId } });
    if (!folder) {
      return NextResponse.json({ error: "Destination folder not found in this project" }, { status: 404 });
    }
  }

  if (status !== undefined && !Object.values(DocumentStatus).includes(status as DocumentStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.document.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(discipline !== undefined ? { discipline: discipline as never } : {}),
      ...(type !== undefined ? { type: type as never } : {}),
      ...(building !== undefined ? { building } : {}),
      ...(floor !== undefined ? { floor } : {}),
      ...(folderId !== undefined ? { folderId } : {}),
      ...(status !== undefined ? { status: status as DocumentStatus } : {}),
    },
  });

  await prisma.activity.create({
    data: {
      action: folderId !== undefined ? "MOVED" : "COMMENTED",
      documentId: id,
      userId: session.user.id,
      message:
        folderId !== undefined
          ? `${session.user.name} moved "${document.name}"`
          : `${session.user.name} updated "${document.name}"`,
    },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  if (!document.deletedAt) {
    return NextResponse.json({ error: "Document must be in the Recycle Bin before it can be purged" }, { status: 400 });
  }

  await prisma.documentVersion.deleteMany({ where: { documentId: id } });
  await prisma.documentApproval.deleteMany({ where: { documentId: id } });
  await prisma.comment.deleteMany({ where: { documentId: id } });
  await prisma.activity.updateMany({ where: { documentId: id }, data: { documentId: null } });
  await prisma.document.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
