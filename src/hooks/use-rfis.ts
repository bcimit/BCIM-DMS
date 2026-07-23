import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { RfiListResponse, RfiStatsResponse } from "@/types/rfi";

export type RfiFilters = {
  projectId: string;
  status?: string;
  priority?: string;
  discipline?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export function useRfis(filters: RfiFilters) {
  const params = new URLSearchParams();
  params.set("projectId", filters.projectId);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.discipline) params.set("discipline", filters.discipline);
  if (filters.search) params.set("search", filters.search);
  params.set("page", String(filters.page ?? 1));
  params.set("pageSize", String(filters.pageSize ?? 8));

  return useQuery({
    queryKey: ["rfis", filters],
    queryFn: () => fetcher<RfiListResponse>(`/api/rfis?${params.toString()}`),
    placeholderData: (prev) => prev,
  });
}

export function useRfiStats(projectId: string) {
  return useQuery({
    queryKey: ["rfi-stats", projectId],
    queryFn: () => fetcher<RfiStatsResponse>(`/api/rfis/stats?projectId=${projectId}`),
  });
}
