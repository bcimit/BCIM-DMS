import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/permissions";
import { timeAgo } from "@/lib/format";

export type NotificationItem = {
  id: string;
  title: string;
  time: string;
  href: string;
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = isAdminRole(session.user.role);

  const documents = await prisma.document.findMany({
    where: admin
      ? { deletedAt: null, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } }
      : { deletedAt: null, uploadedById: session.user.id, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: { id: true, name: true, status: true, updatedAt: true, projectId: true },
  });

  const items: NotificationItem[] = documents.map((d) => ({
    id: d.id,
    title: admin
      ? `"${d.name}" is pending your approval`
      : `Your document "${d.name}" is ${d.status === "SUBMITTED" ? "submitted" : "under review"}`,
    time: timeAgo(d.updatedAt.toISOString()),
    href: `/documents?project=${d.projectId}`,
  }));

  return NextResponse.json({ data: items });
}
