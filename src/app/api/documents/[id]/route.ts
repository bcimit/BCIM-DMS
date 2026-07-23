import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
