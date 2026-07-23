import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { DocumentListResponse } from "@/types/document";

export type DocumentFilters = {
  projectId: string;
  folderId?: string | null;
  search?: string;
  type?: string;
  status?: string;
  discipline?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export function useDocuments(filters: DocumentFilters) {
  const params = new URLSearchParams();
  params.set("projectId", filters.projectId);
  if (filters.folderId) params.set("folderId", filters.folderId);
  if (filters.search) params.set("search", filters.search);
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);
  if (filters.discipline) params.set("discipline", filters.discipline);
  params.set("page", String(filters.page ?? 1));
  params.set("pageSize", String(filters.pageSize ?? 8));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDir) params.set("sortDir", filters.sortDir);

  return useQuery({
    queryKey: ["documents", filters],
    queryFn: () => fetcher<DocumentListResponse>(`/api/documents?${params.toString()}`),
    placeholderData: (prev) => prev,
  });
}
