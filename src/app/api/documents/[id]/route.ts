import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/permissions";

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
