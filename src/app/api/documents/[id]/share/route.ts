import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createShareLink } from "@/lib/graph";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    select: { fileUrl: true, storageItemId: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (!document.storageItemId) {
    return NextResponse.json({ data: { url: document.fileUrl } });
  }

  try {
    const url = await createShareLink(document.storageItemId);
    return NextResponse.json({ data: { url } });
  } catch (e) {
    console.error("Failed to create share link:", e);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 502 });
  }
}
