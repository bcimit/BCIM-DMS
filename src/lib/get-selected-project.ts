import { prisma } from "@/lib/prisma";

export async function getSelectedProject(projectIdParam?: string) {
  return projectIdParam
    ? prisma.project.findUnique({ where: { id: projectIdParam }, select: { id: true } })
    : prisma.project.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
}
