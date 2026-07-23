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
  approvedBy?: string;
  approvedAt?: string;
  status: string;
  fileUrl?: string;
  updatedAt: string;
};

export type ErpPurchaseOrder = ErpWorkOrder & {
  purchaseOrderNo: string;
  subTotal?: number;
  totalGst?: number;
};

export type ErpMrs = {
  projectCode: string;
  projectName?: string;
  mrsNo: string;
  purpose: string;
  department?: string;
  status: string;
  requestedBy?: string;
  requestedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  items?: { materialName: string; quantity: number; unit: string }[];
  fileUrl?: string;
  updatedAt: string;
};

export async function pingErp(): Promise<{ ok: boolean; companyId: string; scopes: string[] }> {
  const res = await erpFetch("/ping");
  if (!res.ok) throw new Error(`ERP ping failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function fetchApprovedWorkOrders(since: Date): Promise<ErpWorkOrder[]> {
  const res = await erpFetch(`/work-orders?status=approved&since=${since.toISOString()}`);
  if (!res.ok) throw new Error(`ERP work-orders fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function fetchApprovedPurchaseOrders(since: Date): Promise<ErpPurchaseOrder[]> {
  const res = await erpFetch(`/purchase-orders?status=approved&since=${since.toISOString()}`);
  if (!res.ok) throw new Error(`ERP purchase-orders fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function fetchApprovedMrs(since: Date): Promise<ErpMrs[]> {
  const res = await erpFetch(`/mrs?status=approved_md&since=${since.toISOString()}`);
  if (!res.ok) throw new Error(`ERP mrs fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}
