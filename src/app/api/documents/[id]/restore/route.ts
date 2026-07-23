import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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

  await prisma.document.update({ where: { id }, data: { deletedAt: null } });

  await prisma.activity.create({
    data: {
      action: ActivityAction.RESTORED,
      documentId: document.id,
      userId: session.user.id,
      message: `${session.user.name} restored ${document.name} from Recycle Bin`,
    },
  });

  return NextResponse.json({ success: true });
}
