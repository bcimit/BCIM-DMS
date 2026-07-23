export type SubmittalListItem = {
  id: string;
  submittalNo: string;
  subject: string;
  description: string;
  specSection: string | null;
  submittalType: string;
  discipline: string;
  status: string;
  revision: string;
  reviewComments: string | null;
  dueDate: string;
  projectId: string;
  createdAt: string;
  reviewedAt: string | null;
  submittedBy: { id: string; name: string };
  reviewedBy: { id: string; name: string } | null;
};

export type SubmittalDetail = SubmittalListItem & {
  project: { id: string; name: string };
};

export type SubmittalListResponse = {
  data: SubmittalListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SubmittalStatsResponse = {
  total: number;
  pending: number;
  approved: number;
  reviseResubmit: number;
  overdue: number;
};
