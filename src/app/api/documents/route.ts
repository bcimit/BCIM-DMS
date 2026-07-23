import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma, DocumentType, DocumentStatus, Discipline } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const page = Number(sp.get("page") ?? "1");
  const pageSize = Number(sp.get("pageSize") ?? "8");
  const folderId = sp.get("folderId");
  const projectId = sp.get("projectId");
  const search = sp.get("search");
  const type = sp.get("type") as DocumentType | null;
  const status = sp.get("status") as DocumentStatus | null;
  const discipline = sp.get("discipline") as Discipline | null;
  const sortBy = sp.get("sortBy") ?? "createdAt";
  const sortDir = (sp.get("sortDir") ?? "desc") as "asc" | "desc";

  const where: Prisma.DocumentWhereInput = {
    ...(projectId ? { projectId } : {}),
    ...(folderId ? { folderId } : {}),
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
    ...(discipline ? { discipline } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { documentNo: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, documents] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        uploadedBy: { select: { id: true, name: true, avatarUrl: true } },
        category: { select: { name: true } },
        folder: { select: { id: true, name: true, path: true } },
      },
    }),
  ]);

  return NextResponse.json({
    data: documents,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}
