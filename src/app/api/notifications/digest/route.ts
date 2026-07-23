import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/permissions";
import { notifyAdmins } from "@/lib/notify";
import { timeAgo } from "@/lib/format";

const LOOKBACK_DAYS = 3;

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

  const [activities, folders] = await Promise.all([
    prisma.activity.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { message: true, createdAt: true },
    }),
    prisma.folder.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { path: true, createdAt: true, project: { select: { name: true } } },
    }),
  ]);

  if (activities.length === 0 && folders.length === 0) {
    return NextResponse.json({ data: { sent: false, reason: "Nothing to report in the last 3 days" } });
  }

  const activityRows = activities
    .map((a) => `<li>${a.message} <span style="color:#888">(${timeAgo(a.createdAt.toISOString())})</span></li>`)
    .join("");
  const folderRows = folders
    .map((f) => `<li>${f.project.name}: <strong>${f.path}</strong> <span style="color:#888">(${timeAgo(f.createdAt.toISOString())})</span></li>`)
    .join("");

  const html = `
    Activity digest for the last ${LOOKBACK_DAYS} days:
    ${folders.length > 0 ? `<br/><strong>Folders created</strong><ul>${folderRows}</ul>` : ""}
    ${activities.length > 0 ? `<br/><strong>Recent activity</strong><ul>${activityRows}</ul>` : ""}
  `;

  await notifyAdmins("BCIM DMS activity digest", html);

  return NextResponse.json({ data: { sent: true, activityCount: activities.length, folderCount: folders.length } });
}
