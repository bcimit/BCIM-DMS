import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/graph";
import { ADMIN_ROLES } from "@/lib/permissions";
import type { UserRole } from "@/generated/prisma/client";

const APP_URL = process.env.APP_URL ?? "https://dms.bcim.in";

function buildHtml(message: string, link?: string): string {
  const button = link
    ? `<p><a href="${APP_URL}${link}" style="display:inline-block;padding:10px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-family:sans-serif;">Open in BCIM DMS</a></p>`
    : "";
  return `<div style="font-family:sans-serif;font-size:14px;color:#111;"><p>${message}</p>${button}</div>`;
}

async function safeSend(emails: string[], subject: string, message: string, link?: string) {
  const unique = Array.from(new Set(emails)).filter(Boolean);
  if (unique.length === 0) return;
  try {
    await sendMail(unique, subject, buildHtml(message, link));
  } catch (e) {
    console.error("Email notification failed:", e);
  }
}

export async function notifyAdmins(subject: string, message: string, link?: string) {
  const admins = await prisma.user.findMany({
    where: { role: { in: ADMIN_ROLES as UserRole[] } },
    select: { email: true },
  });
  await safeSend(admins.map((a) => a.email), subject, message, link);
}

export async function notifyUser(userId: string, subject: string, message: string, link?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) return;
  await safeSend([user.email], subject, message, link);
}
