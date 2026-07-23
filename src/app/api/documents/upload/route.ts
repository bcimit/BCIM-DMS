import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inferDocumentType } from "@/lib/infer-document-type";
import { ActivityAction, Discipline, DocumentStatus } from "@/generated/prisma/client";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const projectId = form.get("projectId");
  const folderId = form.get("folderId");
  const discipline = form.get("discipline");

  if (!(file instanceof File) || typeof projectId !== "string" || typeof discipline !== "string") {
    return NextResponse.json({ error: "file, projectId and discipline are required" }, { status: 400 });
  }

  if (!Object.values(Discipline).includes(discipline as Discipline)) {
    return NextResponse.json({ error: "Invalid discipline" }, { status: 400 });
  }

  const uploader = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!uploader) {
    return NextResponse.json({ error: "Uploader user not found" }, { status: 404 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = file.name.split(".").pop() ?? "bin";
  const storedName = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, storedName), bytes);

  const fileUrl = `/uploads/${storedName}`;
  const documentNo = `UPL-${Date.now().toString(36).toUpperCase()}`;

  const document = await prisma.document.create({
    data: {
      documentNo,
      name: file.name,
      type: inferDocumentType(file.name),
      discipline: discipline as Discipline,
      status: DocumentStatus.DRAFT,
      version: "V1",
      sizeBytes: file.size,
      fileUrl,
      projectId,
      folderId: typeof folderId === "string" && folderId ? folderId : null,
      uploadedById: uploader.id,
    },
  });

  await prisma.documentVersion.create({
    data: {
      documentId: document.id,
      version: "V1",
      isMajor: true,
      notes: "Initial upload",
      sizeBytes: file.size,
      fileUrl,
      uploadedById: uploader.id,
    },
  });

  await prisma.activity.create({
    data: {
      action: ActivityAction.UPLOADED,
      documentId: document.id,
      userId: uploader.id,
      message: `${uploader.name} uploaded ${document.name}`,
    },
  });

  return NextResponse.json({ data: document }, { status: 201 });
}
