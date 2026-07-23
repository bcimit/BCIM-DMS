import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma, DocumentType, DocumentStatus, Discipline } from "@/generated/prisma/client";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const folderId = sp.get("folderId");
  const projectId = sp.get("projectId");
  const search = sp.get("search");
  const typeParam = sp.get("type");
  const types = typeParam ? (typeParam.split(",") as DocumentType[]) : null;
  const status = sp.get("status") as DocumentStatus | null;
  const discipline = sp.get("discipline") as Discipline | null;

  const where: Prisma.DocumentWhereInput = {
    deletedAt: null,
    ...(projectId ? { projectId } : {}),
    ...(folderId ? { folderId } : {}),
    ...(types ? (types.length > 1 ? { type: { in: types } } : { type: types[0] }) : {}),
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

  const documents = await prisma.document.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { name: true } },
      folder: { select: { path: true } },
    },
  });

  const header = [
    "Document No",
    "Name",
    "Type",
    "Discipline",
    "Status",
    "Version",
    "Folder",
    "Size (bytes)",
    "Uploaded By",
    "Uploaded On",
  ];

  const rows = documents.map((d) =>
    [
      d.documentNo,
      d.name,
      d.type,
      d.discipline,
      d.status,
      d.version,
      d.folder?.path ?? "/",
      String(d.sizeBytes),
      d.uploadedBy.name,
      d.createdAt.toISOString(),
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="documents-export-${Date.now()}.csv"`,
    },
  });
}
