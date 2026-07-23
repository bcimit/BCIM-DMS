import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPreviewEmbedUrl } from "@/lib/graph";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    select: { storageItemId: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (!document.storageItemId) {
    return NextResponse.json({ error: "No preview available for this document" }, { status: 404 });
  }

  try {
    const url = await getPreviewEmbedUrl(document.storageItemId);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("Failed to get preview embed URL:", e);
    return NextResponse.json({ error: "Failed to retrieve preview" }, { status: 502 });
  }
}
