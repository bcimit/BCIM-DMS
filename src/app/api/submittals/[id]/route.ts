import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notifyUser } from "@/lib/notify";
import { SubmittalStatus } from "@/generated/prisma/client";

const REVIEWED_STATUSES: SubmittalStatus[] = [
  SubmittalStatus.APPROVED,
  SubmittalStatus.APPROVED_AS_NOTED,
  SubmittalStatus.REVISE_RESUBMIT,
  SubmittalStatus.REJECTED,
];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const submittal = await prisma.submittal.findUnique({
    where: { id },
    include: {
      submittedBy: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  if (!submittal) {
    return NextResponse.json({ error: "Submittal not found" }, { status: 404 });
  }

  return NextResponse.json({ data: submittal });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { reviewComments, status } = body as { reviewComments?: string; status?: SubmittalStatus };

  const existing = await prisma.submittal.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Submittal not found" }, { status: 404 });
  }

  const now = new Date();
  const submittal = await prisma.submittal.update({
    where: { id },
    data: {
      ...(reviewComments !== undefined ? { reviewComments } : {}),
      ...(status ? { status } : {}),
      ...(status && REVIEWED_STATUSES.includes(status)
        ? { reviewedAt: now, reviewedById: session.user.id }
        : {}),
    },
    include: {
      submittedBy: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
  });

  if (status && REVIEWED_STATUSES.includes(status)) {
    await notifyUser(
      submittal.submittedBy.id,
      "Your submittal was reviewed",
      `Submittal <strong>${submittal.subject}</strong> was marked as ${status.replaceAll("_", " ").toLowerCase()} by ${session.user.name}.`,
      `/submittals?project=${existing.projectId}`
    );
  }

  return NextResponse.json({ data: submittal });
}
