export type DocumentListItem = {
  id: string;
  documentNo: string;
  name: string;
  description: string | null;
  type: string;
  discipline: string;
  status: string;
  version: string;
  building: string | null;
  floor: string | null;
  area: string | null;
  sizeBytes: number;
  fileUrl: string;
  thumbnailUrl: string | null;
  tags: string[];
  projectId: string;
  folderId: string | null;
  categoryId: string | null;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  uploadedBy: { id: string; name: string; avatarUrl: string | null };
  category: { name: string } | null;
  folder: { id: string; name: string; path: string } | null;
};

export type DocumentListResponse = {
  data: DocumentListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type FolderChild = {
  id: string;
  name: string;
  path: string;
  _count: { documents: number; children: number };
};

export type FoldersResponse = {
  project: { id: string; name: string } | null;
  children: FolderChild[];
  breadcrumb: { id: string; name: string }[];
  documentCount: number;
};

export type ProjectSummary = {
  id: string;
  name: string;
  code: string;
  location: string | null;
  documentCount: number;
  folderCount: number;
  approvedCount: number;
  pendingCount: number;
  lastActivityAt: string;
};

export type StatsResponse = {
  totals: {
    documents: number;
    folders: number;
    drawings: number;
    rfis: number;
    submittals: number;
    approved: number;
  };
  monthDelta: {
    documents: number;
    folders: number;
    drawings: number;
    rfis: number;
    submittals: number;
  };
  statusBreakdown: { status: string; count: number }[];
  trend: { date: string; uploaded: number; approved: number }[];
};

export type ActivityItem = {
  id: string;
  action: string;
  message: string;
  createdAt: string;
  user: { name: string; avatarUrl: string | null };
  document: { name: string } | null;
};
