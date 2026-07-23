import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { folderId } = body as { folderId?: string | null };

  const source = await prisma.document.findUnique({ where: { id } });
  if (!source) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (folderId) {
    const folder = await prisma.folder.findFirst({ where: { id: folderId, projectId: source.projectId } });
    if (!folder) {
      return NextResponse.json({ error: "Destination folder not found in this project" }, { status: 404 });
    }
  }

  const documentNo = `${source.documentNo}-COPY-${Date.now().toString(36).toUpperCase()}`;

  const copy = await prisma.document.create({
    data: {
      documentNo,
      name: `Copy of ${source.name}`,
      description: source.description,
      type: source.type,
      discipline: source.discipline,
      status: "DRAFT",
      version: "V1",
      building: source.building,
      floor: source.floor,
      area: source.area,
      sizeBytes: source.sizeBytes,
      fileUrl: source.fileUrl,
      storageItemId: source.storageItemId,
      thumbnailUrl: source.thumbnailUrl,
      tags: source.tags,
      projectId: source.projectId,
      folderId: folderId !== undefined ? folderId : source.folderId,
      categoryId: source.categoryId,
      uploadedById: session.user.id,
    },
  });

  await prisma.activity.create({
    data: {
      action: "UPLOADED",
      documentId: copy.id,
      userId: session.user.id,
      message: `${session.user.name} copied "${source.name}"`,
    },
  });

  return NextResponse.json({ data: copy });
}
