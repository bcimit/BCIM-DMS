import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notify";
import { ActivityAction } from "@/generated/prisma/client";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await prisma.document.update({ where: { id }, data: { deletedAt: new Date() } });

  await prisma.activity.create({
    data: {
      action: ActivityAction.DELETED,
      documentId: document.id,
      userId: session.user.id,
      message: `${session.user.name} moved ${document.name} to Recycle Bin`,
    },
  });

  await notifyAdmins(
    "Document moved to Recycle Bin",
    `${session.user.name} moved <strong>${document.name}</strong> to the Recycle Bin.`,
    `/recycle-bin?project=${document.projectId}`
  );

  return NextResponse.json({ success: true });
}
