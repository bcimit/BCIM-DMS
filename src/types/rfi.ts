export type RfiListItem = {
  id: string;
  rfiNo: string;
  subject: string;
  question: string;
  response: string | null;
  discipline: string;
  priority: string;
  status: string;
  dueDate: string;
  projectId: string;
  createdAt: string;
  answeredAt: string | null;
  closedAt: string | null;
  raisedBy: { id: string; name: string };
  assignedTo: { id: string; name: string } | null;
};

export type RfiDetail = RfiListItem & {
  project: { id: string; name: string };
};

export type RfiListResponse = {
  data: RfiListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type RfiStatsResponse = {
  total: number;
  open: number;
  answered: number;
  closed: number;
  overdue: number;
};
