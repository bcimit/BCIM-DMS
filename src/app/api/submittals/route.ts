import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { Prisma, Discipline, SubmittalStatus, SubmittalType } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const projectId = sp.get("projectId");
  const status = sp.get("status") as SubmittalStatus | null;
  const submittalType = sp.get("submittalType") as SubmittalType | null;
  const discipline = sp.get("discipline") as Discipline | null;
  const search = sp.get("search");
  const page = Number(sp.get("page") ?? "1");
  const pageSize = Number(sp.get("pageSize") ?? "8");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const where: Prisma.SubmittalWhereInput = {
    projectId,
    ...(status ? { status } : {}),
    ...(submittalType ? { submittalType } : {}),
    ...(discipline ? { discipline } : {}),
    ...(search
      ? {
          OR: [
            { submittalNo: { contains: search, mode: "insensitive" } },
            { subject: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, data] = await Promise.all([
    prisma.submittal.count({ where }),
    prisma.submittal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        submittedBy: { select: { id: true, name: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, subject, description, specSection, submittalType, discipline, dueDate, reviewedById } = body;

  if (!projectId || !subject || !description || !discipline || !dueDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const count = await prisma.submittal.count({ where: { projectId } });
  const submittalNo = `SUB-${projectId.slice(-4).toUpperCase()}-${String(count + 1).padStart(3, "0")}`;

  const submittal = await prisma.submittal.create({
    data: {
      submittalNo,
      subject,
      description,
      specSection: specSection || null,
      submittalType: submittalType ?? "SHOP_DRAWING",
      discipline,
      dueDate: new Date(dueDate),
      projectId,
      submittedById: session.user.id,
      reviewedById: reviewedById || null,
    },
    include: {
      submittedBy: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ data: submittal }, { status: 201 });
}
