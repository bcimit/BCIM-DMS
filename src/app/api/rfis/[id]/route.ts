import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notifyUser } from "@/lib/notify";
import { RfiStatus } from "@/generated/prisma/client";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rfi = await prisma.rfi.findUnique({
    where: { id },
    include: {
      raisedBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  if (!rfi) {
    return NextResponse.json({ error: "RFI not found" }, { status: 404 });
  }

  return NextResponse.json({ data: rfi });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { response, status } = body as { response?: string; status?: RfiStatus };

  const existing = await prisma.rfi.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "RFI not found" }, { status: 404 });
  }

  const now = new Date();
  const rfi = await prisma.rfi.update({
    where: { id },
    data: {
      ...(response !== undefined ? { response } : {}),
      ...(status ? { status } : {}),
      ...(status === RfiStatus.ANSWERED && !existing.answeredAt ? { answeredAt: now } : {}),
      ...(status === RfiStatus.CLOSED ? { closedAt: now } : {}),
    },
    include: {
      raisedBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });

  if (status === RfiStatus.ANSWERED) {
    await notifyUser(
      rfi.raisedBy.id,
      "Your RFI was answered",
      `RFI <strong>${rfi.subject}</strong> was answered by ${rfi.assignedTo?.name ?? "the assignee"}.`,
      `/rfi?project=${existing.projectId}`
    );
  } else if (status === RfiStatus.CLOSED) {
    await notifyUser(
      rfi.raisedBy.id,
      "Your RFI was closed",
      `RFI <strong>${rfi.subject}</strong> was closed.`,
      `/rfi?project=${existing.projectId}`
    );
  }

  return NextResponse.json({ data: rfi });
}
