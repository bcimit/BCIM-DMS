import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inferDocumentType } from "@/lib/infer-document-type";
import { uploadToSharePoint } from "@/lib/graph";
import { notifyAdmins } from "@/lib/notify";
import { ActivityAction, Discipline, DocumentStatus, DocumentType } from "@/generated/prisma/client";

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
  const typeOverride = form.get("type");

  if (!(file instanceof File) || typeof projectId !== "string" || typeof discipline !== "string") {
    return NextResponse.json({ error: "file, projectId and discipline are required" }, { status: 400 });
  }

  if (typeof typeOverride === "string" && !Object.values(DocumentType).includes(typeOverride as DocumentType)) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }

  if (!Object.values(Discipline).includes(discipline as Discipline)) {
    return NextResponse.json({ error: "Invalid discipline" }, { status: 400 });
  }

  const uploader = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!uploader) {
    return NextResponse.json({ error: "Uploader user not found" }, { status: 404 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  let uploaded;
  try {
    uploaded = await uploadToSharePoint(file.name, file.type, bytes);
  } catch (e) {
    console.error("SharePoint upload failed:", e);
    return NextResponse.json({ error: "Failed to upload file to SharePoint" }, { status: 502 });
  }

  const fileUrl = uploaded.webUrl;
  const documentNo = `UPL-${Date.now().toString(36).toUpperCase()}`;

  const document = await prisma.document.create({
    data: {
      documentNo,
      name: file.name,
      type: typeof typeOverride === "string" ? (typeOverride as DocumentType) : inferDocumentType(file.name),
      discipline: discipline as Discipline,
      status: DocumentStatus.DRAFT,
      version: "V1",
      sizeBytes: file.size,
      fileUrl,
      storageItemId: uploaded.itemId,
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
      storageItemId: uploaded.itemId,
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

  await notifyAdmins(
    "New document uploaded",
    `${uploader.name} uploaded <strong>${document.name}</strong>.`,
    `/documents?project=${document.projectId}`
  );

  return NextResponse.json({ data: document }, { status: 201 });
}
