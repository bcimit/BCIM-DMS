import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubmittalStatus } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const now = new Date();
  const pendingStatuses = [SubmittalStatus.DRAFT, SubmittalStatus.SUBMITTED, SubmittalStatus.UNDER_REVIEW];
  const approvedStatuses = [SubmittalStatus.APPROVED, SubmittalStatus.APPROVED_AS_NOTED];

  const [total, pending, approved, reviseResubmit, overdue] = await Promise.all([
    prisma.submittal.count({ where: { projectId } }),
    prisma.submittal.count({ where: { projectId, status: { in: pendingStatuses } } }),
    prisma.submittal.count({ where: { projectId, status: { in: approvedStatuses } } }),
    prisma.submittal.count({ where: { projectId, status: SubmittalStatus.REVISE_RESUBMIT } }),
    prisma.submittal.count({
      where: { projectId, status: { in: pendingStatuses }, dueDate: { lt: now } },
    }),
  ]);

  return NextResponse.json({ total, pending, approved, reviseResubmit, overdue });
}
