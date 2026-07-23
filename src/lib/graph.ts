const TENANT_ID = process.env.ONEDRIVE_TENANT_ID!;
const CLIENT_ID = process.env.ONEDRIVE_CLIENT_ID!;
const CLIENT_SECRET = process.env.ONEDRIVE_CLIENT_SECRET!;
const SITE_URL = process.env.SHAREPOINT_SITE_URL!;
const UPLOAD_FOLDER = "DMS-Uploads";

let cachedToken: { value: string; expiresAt: number } | null = null;
let cachedDriveId: string | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const res = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "https://graph.microsoft.com/.default",
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to acquire Graph API token: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}

async function graphFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  const url = path.startsWith("https://") ? path : `https://graph.microsoft.com/v1.0${path}`;
  return fetch(url, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}` },
  });
}

async function getDriveId(): Promise<string> {
  if (cachedDriveId) return cachedDriveId;

  const url = new URL(SITE_URL);
  const siteRes = await graphFetch(`/sites/${url.hostname}:${url.pathname}`);
  if (!siteRes.ok) {
    throw new Error(`Failed to resolve SharePoint site: ${siteRes.status} ${await siteRes.text()}`);
  }
  const site = await siteRes.json();

  const driveRes = await graphFetch(`/sites/${site.id}/drive`);
  if (!driveRes.ok) {
    throw new Error(`Failed to resolve SharePoint drive: ${driveRes.status} ${await driveRes.text()}`);
  }
  const drive = await driveRes.json();

  cachedDriveId = drive.id;
  return drive.id;
}

export type SharePointUploadResult = {
  itemId: string;
  webUrl: string;
  downloadUrl: string;
};

export async function uploadToSharePoint(
  fileName: string,
  contentType: string,
  bytes: Buffer
): Promise<SharePointUploadResult> {
  const driveId = await getDriveId();
  const safeName = fileName.replace(/[#%*:<>?/\\{|}]/g, "_");
  const path = `${UPLOAD_FOLDER}/${Date.now()}-${safeName}`;

  const res = await graphFetch(`/drives/${driveId}/root:/${encodeURIComponent(path)}:/content`, {
    method: "PUT",
    headers: { "Content-Type": contentType || "application/octet-stream" },
    body: bytes as unknown as BodyInit,
  });

  if (!res.ok) {
    throw new Error(`SharePoint upload failed: ${res.status} ${await res.text()}`);
  }

  const item = await res.json();
  return {
    itemId: item.id,
    webUrl: item.webUrl,
    downloadUrl: item["@microsoft.graph.downloadUrl"],
  };
}

export async function getFreshDownloadUrl(itemId: string): Promise<string> {
  const driveId = await getDriveId();
  const res = await graphFetch(`/drives/${driveId}/items/${itemId}?$select=@microsoft.graph.downloadUrl`);
  if (!res.ok) {
    throw new Error(`Failed to fetch download URL: ${res.status} ${await res.text()}`);
  }
  const item = await res.json();
  return item["@microsoft.graph.downloadUrl"];
}

export async function getPreviewEmbedUrl(itemId: string): Promise<string> {
  const driveId = await getDriveId();
  const res = await graphFetch(`/drives/${driveId}/items/${itemId}/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch preview URL: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.getUrl;
}

export type DriveQuota = {
  used: number;
  total: number;
  remaining: number;
};

export async function getDriveQuota(): Promise<DriveQuota> {
  const driveId = await getDriveId();
  const res = await graphFetch(`/drives/${driveId}?$select=quota`);
  if (!res.ok) {
    throw new Error(`Failed to fetch drive quota: ${res.status} ${await res.text()}`);
  }
  const drive = await res.json();
  return {
    used: drive.quota?.used ?? 0,
    total: drive.quota?.total ?? 0,
    remaining: drive.quota?.remaining ?? 0,
  };
}
