import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notify";
import { fetchApprovedWorkOrders, fetchApprovedPurchaseOrders, fetchApprovedMrs } from "@/lib/erp-client";
import { ActivityAction, DocumentStatus, DocumentType, Discipline, UserRole } from "@/generated/prisma/client";

const DEFAULT_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

const DISCIPLINE_MAP: Record<string, Discipline> = Object.fromEntries(
  Object.values(Discipline).map((d) => [d.toLowerCase().replaceAll("_", " "), d])
);

function resolveDiscipline(department?: string): Discipline {
  if (!department) return Discipline.PROCUREMENT;
  return DISCIPLINE_MAP[department.toLowerCase().trim()] ?? Discipline.PROCUREMENT;
}

async function getOrCreateFolderPath(projectId: string, segments: string[]) {
  let parentId: string | null = null;
  let path = "";
  let folder = null;
  for (const name of segments) {
    path += `/${name}`;
    folder = await prisma.folder.findFirst({ where: { projectId, parentId, name } });
    if (!folder) {
      folder = await prisma.folder.create({ data: { projectId, parentId, name, path } });
    }
    parentId = folder.id;
  }
  return folder;
}

async function getOrCreateProject(code: string, name?: string) {
  const existing = await prisma.project.findUnique({ where: { code } });
  if (existing) return { project: existing, created: false };

  const project = await prisma.project.create({
    data: { name: name?.trim() || code, code },
  });
  await prisma.folder.create({ data: { name: "Construction", path: "/Construction", projectId: project.id } });

  return { project, created: true };
}

async function getSystemUploader() {
  return (
    (await prisma.user.findFirst({ where: { role: UserRole.SUPER_ADMIN } })) ??
    (await prisma.user.findFirst({ where: { role: UserRole.DOCUMENT_CONTROLLER } }))
  );
}

async function getSince(key: string): Promise<Date> {
  const state = await prisma.integrationSyncState.findUnique({ where: { key } });
  return state?.lastSyncedAt ?? new Date(Date.now() - DEFAULT_LOOKBACK_MS);
}

async function setSince(key: string, date: Date) {
  await prisma.integrationSyncState.upsert({
    where: { key },
    create: { key, lastSyncedAt: date },
    update: { lastSyncedAt: date },
  });
}

async function upsertSyncedDocument(params: {
  documentNo: string;
  name: string;
  description: string;
  type: DocumentType;
  discipline: Discipline;
  projectId: string;
  folderId: string;
  fileUrl?: string;
  uploaderId: string;
}) {
  const existing = await prisma.document.findUnique({ where: { documentNo: params.documentNo } });
  if (existing) {
    await prisma.document.update({
      where: { id: existing.id },
      data: { description: params.description, status: DocumentStatus.APPROVED },
    });
    return { created: false, id: existing.id };
  }

  const document = await prisma.document.create({
    data: {
      documentNo: params.documentNo,
      name: params.name,
      description: params.description,
      type: params.type,
      discipline: params.discipline,
      status: DocumentStatus.APPROVED,
      version: "V1",
      sizeBytes: 0,
      fileUrl: params.fileUrl ?? `https://erp.bcim.in`,
      projectId: params.projectId,
      folderId: params.folderId,
      uploadedById: params.uploaderId,
    },
  });

  await prisma.activity.create({
    data: {
      action: ActivityAction.UPLOADED,
      documentId: document.id,
      userId: params.uploaderId,
      message: `${params.name} synced from ERP`,
    },
  });

  return { created: true, id: document.id };
}

export async function runErpSync(): Promise<{
  workOrders: number;
  purchaseOrders: number;
  mrs: number;
  projectsCreated: string[];
  errors: string[];
}> {
  const uploader = await getSystemUploader();
  const errors: string[] = [];
  const projectsCreated: string[] = [];
  const result = { workOrders: 0, purchaseOrders: 0, mrs: 0, projectsCreated, errors };

  if (!uploader) {
    errors.push("No admin user available to attribute synced documents to");
    return result;
  }

  const now = new Date();

  try {
    const since = await getSince("work-orders");
    const workOrders = await fetchApprovedWorkOrders(since);
    for (const wo of workOrders) {
      const { project, created: projectCreated } = await getOrCreateProject(wo.projectCode);
      if (projectCreated) projectsCreated.push(project.code);
      const folder = await getOrCreateFolderPath(project.id, ["Procurement", "Work Orders"]);
      const { created } = await upsertSyncedDocument({
        documentNo: wo.workOrderNo,
        name: `${wo.workOrderNo} - ${wo.title}`,
        description: [
          wo.vendorName ? `Vendor: ${wo.vendorName}` : null,
          wo.amount ? `Amount: ${wo.amount.toLocaleString()}` : null,
          wo.createdBy ? `Created by: ${wo.createdBy}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
        type: DocumentType.WORK_ORDER,
        discipline: Discipline.PROCUREMENT,
        projectId: project.id,
        folderId: folder!.id,
        fileUrl: wo.fileUrl,
        uploaderId: uploader.id,
      });
      if (created) result.workOrders++;
    }
    await setSince("work-orders", now);
  } catch (e) {
    errors.push(`work-orders: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const since = await getSince("purchase-orders");
    const purchaseOrders = await fetchApprovedPurchaseOrders(since);
    for (const po of purchaseOrders) {
      const { project, created: projectCreated } = await getOrCreateProject(po.projectCode);
      if (projectCreated) projectsCreated.push(project.code);
      const folder = await getOrCreateFolderPath(project.id, ["Procurement", "Purchase Orders"]);
      const { created } = await upsertSyncedDocument({
        documentNo: po.purchaseOrderNo,
        name: `${po.purchaseOrderNo}${po.vendorName ? ` - ${po.vendorName}` : ""}`,
        description: [
          po.vendorName ? `Vendor: ${po.vendorName}` : null,
          po.subTotal ? `Subtotal: ${po.subTotal.toLocaleString()}` : null,
          po.totalGst ? `GST: ${po.totalGst.toLocaleString()}` : null,
          po.amount ? `Total: ${po.amount.toLocaleString()}` : null,
          po.approvedBy ? `Approved by: ${po.approvedBy}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
        type: DocumentType.PURCHASE_ORDER,
        discipline: Discipline.PROCUREMENT,
        projectId: project.id,
        folderId: folder!.id,
        fileUrl: po.fileUrl,
        uploaderId: uploader.id,
      });
      if (created) result.purchaseOrders++;
    }
    await setSince("purchase-orders", now);
  } catch (e) {
    errors.push(`purchase-orders: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const since = await getSince("mrs");
    const mrsList = await fetchApprovedMrs(since);
    for (const mrs of mrsList) {
      const { project, created: projectCreated } = await getOrCreateProject(mrs.projectCode, mrs.projectName);
      if (projectCreated) projectsCreated.push(project.code);
      const folder = await getOrCreateFolderPath(project.id, ["Procurement", "Material Requisitions"]);
      const itemsList = mrs.items
        ?.map((i) => `${i.materialName} (${i.quantity} ${i.unit}${i.purpose ? ` — ${i.purpose}` : ""})`)
        .join(", ");
      const { created } = await upsertSyncedDocument({
        documentNo: mrs.mrsNo,
        name: `${mrs.mrsNo}${mrs.remarks ? ` - ${mrs.remarks}` : ""}`,
        description: [
          mrs.department ? `Department: ${mrs.department}` : null,
          mrs.priority ? `Priority: ${mrs.priority}` : null,
          mrs.requestedBy ? `Requested by: ${mrs.requestedBy}` : null,
          mrs.approvedBy ? `Approved by: ${mrs.approvedBy}` : null,
          itemsList ? `Items: ${itemsList}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
        type: DocumentType.MATERIAL_REQUISITION,
        discipline: resolveDiscipline(mrs.department),
        projectId: project.id,
        folderId: folder!.id,
        fileUrl: mrs.fileUrl,
        uploaderId: uploader.id,
      });
      if (created) result.mrs++;
    }
    await setSince("mrs", now);
  } catch (e) {
    errors.push(`mrs: ${e instanceof Error ? e.message : String(e)}`);
  }

  const totalCreated = result.workOrders + result.purchaseOrders + result.mrs;
  if (totalCreated > 0 || projectsCreated.length > 0) {
    const projectNote =
      projectsCreated.length > 0
        ? ` New project(s) auto-created for unmapped ERP codes: ${projectsCreated.join(", ")}.`
        : "";
    await notifyAdmins(
      "ERP sync: new procurement documents",
      `Synced from ERP: ${result.workOrders} work order(s), ${result.purchaseOrders} purchase order(s), ${result.mrs} material requisition(s).${projectNote}`,
      "/documents"
    );
  }

  return result;
}
