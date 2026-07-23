import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToSharePoint } from "@/lib/graph";
import { notifyAdmins } from "@/lib/notify";
import { ActivityAction, DocumentStatus, DocumentType, Discipline, UserRole } from "@/generated/prisma/client";

const WEBHOOK_SECRET = process.env.ERP_WEBHOOK_SECRET;

type WorkOrderPayload = {
  projectCode: string;
  workOrderNo: string;
  title: string;
  vendorName?: string;
  amount?: number;
  approvedBy?: string;
  approvedAt?: string;
  fileUrl?: string;
  notes?: string;
};

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  if (req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as WorkOrderPayload | null;
  if (!body?.projectCode || !body.workOrderNo || !body.title) {
    return NextResponse.json({ error: "projectCode, workOrderNo, and title are required" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({ where: { code: body.projectCode } });
  if (!project) {
    return NextResponse.json({ error: `No project found with code "${body.projectCode}"` }, { status: 404 });
  }

  let folder = await prisma.folder.findFirst({ where: { projectId: project.id, parentId: null, name: "Procurement" } });
  if (!folder) {
    folder = await prisma.folder.create({
      data: { projectId: project.id, parentId: null, name: "Procurement", path: "/Procurement" },
    });
  }

  const uploader =
    (await prisma.user.findFirst({ where: { role: UserRole.SUPER_ADMIN } })) ??
    (await prisma.user.findFirst({ where: { role: UserRole.DOCUMENT_CONTROLLER } }));
  if (!uploader) {
    return NextResponse.json({ error: "No admin user available to attribute this document to" }, { status: 500 });
  }

  let fileUrl = body.fileUrl ?? `https://erp.bcim.in/work-orders/${encodeURIComponent(body.workOrderNo)}`;
  let storageItemId: string | null = null;
  let sizeBytes = 0;

  if (body.fileUrl) {
    try {
      const fileRes = await fetch(body.fileUrl);
      if (fileRes.ok) {
        const bytes = Buffer.from(await fileRes.arrayBuffer());
        const contentType = fileRes.headers.get("content-type") ?? "application/octet-stream";
        const fileName = `${body.workOrderNo}.pdf`;
        const uploaded = await uploadToSharePoint(fileName, contentType, bytes);
        fileUrl = uploaded.webUrl;
        storageItemId = uploaded.itemId;
        sizeBytes = bytes.length;
      }
    } catch (e) {
      console.error("Failed to fetch/store work order file from ERP:", e);
    }
  }

  const existing = await prisma.document.findUnique({ where: { documentNo: body.workOrderNo } });
  const documentNo = existing ? `${body.workOrderNo}-${Date.now().toString(36).toUpperCase()}` : body.workOrderNo;

  const descriptionParts = [
    body.vendorName ? `Vendor: ${body.vendorName}` : null,
    body.amount ? `Amount: ${body.amount.toLocaleString()}` : null,
    body.approvedBy ? `Approved by: ${body.approvedBy}` : null,
    body.notes ?? null,
  ].filter(Boolean);

  const document = await prisma.document.create({
    data: {
      documentNo,
      name: `${body.workOrderNo} - ${body.title}`,
      description: descriptionParts.length > 0 ? descriptionParts.join(" · ") : null,
      type: DocumentType.WORK_ORDER,
      discipline: Discipline.PROCUREMENT,
      status: DocumentStatus.APPROVED,
      version: "V1",
      sizeBytes,
      fileUrl,
      storageItemId,
      projectId: project.id,
      folderId: folder.id,
      uploadedById: uploader.id,
    },
  });

  await prisma.activity.create({
    data: {
      action: ActivityAction.UPLOADED,
      documentId: document.id,
      userId: uploader.id,
      message: `Work Order ${body.workOrderNo} (${body.title}) approved${body.approvedBy ? ` by ${body.approvedBy}` : ""} — synced from ERP`,
    },
  });

  await notifyAdmins(
    "Work Order approved in ERP",
    `Work Order <strong>${body.workOrderNo}</strong> (${body.title}) was approved${body.approvedBy ? ` by ${body.approvedBy}` : ""} and synced into project <strong>${project.name}</strong>.`,
    `/documents?project=${project.id}`
  );

  return NextResponse.json({ data: { documentId: document.id } }, { status: 201 });
}
