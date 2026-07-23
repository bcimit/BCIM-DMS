import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getFreshDownloadUrl } from "@/lib/graph";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    return NextResponse.redirect(document.fileUrl);
  }

  try {
    const downloadUrl = await getFreshDownloadUrl(document.storageItemId);
    return NextResponse.redirect(downloadUrl);
  } catch (e) {
    console.error("Failed to get fresh download URL:", e);
    return NextResponse.json({ error: "Failed to retrieve file" }, { status: 502 });
  }
}
