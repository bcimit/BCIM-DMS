const BASE_URL = process.env.ERP_API_BASE_URL ?? "https://erp.bcim.in/api/v1/integration";
const API_KEY = process.env.ERP_API_KEY;

async function erpFetch(path: string): Promise<Response> {
  if (!API_KEY) {
    throw new Error("ERP_API_KEY is not configured");
  }
  return fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
}

export type ErpWorkOrder = {
  projectCode: string;
  workOrderNo: string;
  title: string;
  vendorName?: string;
  amount?: number;
  createdBy?: string;
  status: string;
  fileUrl?: string;
  pdfUrl?: string | null;
  updatedAt: string;
};

export type ErpPurchaseOrder = {
  projectCode: string;
  purchaseOrderNo: string;
  vendorName?: string;
  subTotal?: number;
  totalGst?: number;
  amount?: number;
  approvedBy?: string;
  approvedAt?: string;
  status: string;
  fileUrl?: string;
  pdfUrl?: string | null;
  updatedAt: string;
};

export type ErpMrs = {
  projectCode: string;
  projectName?: string;
  mrsNo: string;
  remarks?: string;
  department?: string;
  priority?: string;
  status: string;
  requestedBy?: string;
  requestedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  items?: { materialName: string; quantity: number; unit: string; purpose?: string }[];
  fileUrl?: string;
  pdfUrl?: string | null;
  updatedAt: string;
};

export type ErpPdf = { bytes: Buffer; contentType: string } | null;

export async function downloadErpPdf(pdfUrl: string): Promise<ErpPdf> {
  if (!API_KEY) {
    throw new Error("ERP_API_KEY is not configured");
  }
  const res = await fetch(pdfUrl, { headers: { Authorization: `Bearer ${API_KEY}` } });
  if (res.status === 404 || res.status === 410) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`ERP PDF download failed: ${res.status} ${await res.text()}`);
  }
  const bytes = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "application/pdf";
  return { bytes, contentType };
}

export async function pingErp(): Promise<{ ok: boolean; companyId: string; scopes: string[] }> {
  const res = await erpFetch("/ping");
  if (!res.ok) throw new Error(`ERP ping failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function fetchApprovedWorkOrders(since: Date): Promise<ErpWorkOrder[]> {
  const res = await erpFetch(`/work-orders?status=approved&since=${since.toISOString()}&limit=1000`);
  if (!res.ok) throw new Error(`ERP work-orders fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function fetchApprovedPurchaseOrders(since: Date): Promise<ErpPurchaseOrder[]> {
  const res = await erpFetch(`/purchase-orders?status=approved&since=${since.toISOString()}&limit=1000`);
  if (!res.ok) throw new Error(`ERP purchase-orders fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function fetchApprovedMrs(since: Date): Promise<ErpMrs[]> {
  const res = await erpFetch(`/mrs?status=approved_md&since=${since.toISOString()}&limit=1000`);
  if (!res.ok) throw new Error(`ERP mrs fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}
