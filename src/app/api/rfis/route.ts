import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notifyAdmins, notifyUser } from "@/lib/notify";
import type { Prisma, Discipline, RfiPriority, RfiStatus } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const projectId = sp.get("projectId");
  const status = sp.get("status") as RfiStatus | null;
  const priority = sp.get("priority") as RfiPriority | null;
  const discipline = sp.get("discipline") as Discipline | null;
  const search = sp.get("search");
  const page = Number(sp.get("page") ?? "1");
  const pageSize = Number(sp.get("pageSize") ?? "8");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const where: Prisma.RfiWhereInput = {
    projectId,
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(discipline ? { discipline } : {}),
    ...(search
      ? {
          OR: [
            { rfiNo: { contains: search, mode: "insensitive" } },
            { subject: { contains: search, mode: "insensitive" } },
            { question: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, data] = await Promise.all([
    prisma.rfi.count({ where }),
    prisma.rfi.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        raisedBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
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
  const { projectId, subject, question, discipline, priority, dueDate, assignedToId } = body;

  if (!projectId || !subject || !question || !discipline || !dueDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const count = await prisma.rfi.count({ where: { projectId } });
  const rfiNo = `RFI-${projectId.slice(-4).toUpperCase()}-${String(count + 1).padStart(3, "0")}`;

  const rfi = await prisma.rfi.create({
    data: {
      rfiNo,
      subject,
      question,
      discipline,
      priority: priority ?? "MEDIUM",
      dueDate: new Date(dueDate),
      projectId,
      raisedById: session.user.id,
      assignedToId: assignedToId || null,
    },
    include: {
      raisedBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });

  const link = `/rfi?project=${projectId}`;
  if (rfi.assignedTo) {
    await notifyUser(rfi.assignedTo.id, "New RFI assigned to you", `${rfi.raisedBy.name} raised RFI <strong>${rfi.subject}</strong> and assigned it to you.`, link);
  } else {
    await notifyAdmins("New RFI raised", `${rfi.raisedBy.name} raised RFI <strong>${rfi.subject}</strong>.`, link);
  }

  return NextResponse.json({ data: rfi }, { status: 201 });
}
