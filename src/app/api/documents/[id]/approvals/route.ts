import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/permissions";
import { DocumentStatus } from "@/generated/prisma/client";

const ALLOWED_TARGETS: DocumentStatus[] = [
  DocumentStatus.SUBMITTED,
  DocumentStatus.UNDER_REVIEW,
  DocumentStatus.APPROVED,
  DocumentStatus.REJECTED,
];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, comment } = body as { status?: string; comment?: string };

  if (!status || !ALLOWED_TARGETS.includes(status as DocumentStatus)) {
    return NextResponse.json({ error: "Invalid target status" }, { status: 400 });
  }

  const isDecision = status === DocumentStatus.APPROVED || status === DocumentStatus.REJECTED;
  if (isDecision && !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Only admins can approve or reject documents" }, { status: 403 });
  }

  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const [updated] = await prisma.$transaction([
    prisma.document.update({ where: { id }, data: { status: status as DocumentStatus } }),
    prisma.documentApproval.create({
      data: { documentId: id, status: status as DocumentStatus, comment: comment || null, actorId: session.user.id },
    }),
    prisma.activity.create({
      data: {
        action: isDecision ? (status === DocumentStatus.APPROVED ? "APPROVED" : "REJECTED") : "SUBMITTED",
        documentId: id,
        userId: session.user.id,
        message: `${session.user.name} ${status === DocumentStatus.APPROVED ? "approved" : status === DocumentStatus.REJECTED ? "rejected" : "submitted"} "${document.name}"`,
      },
    }),
  ]);

  return NextResponse.json({ data: updated });
}
