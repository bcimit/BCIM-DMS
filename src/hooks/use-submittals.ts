import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { SubmittalListResponse, SubmittalStatsResponse } from "@/types/submittal";

export type SubmittalFilters = {
  projectId: string;
  status?: string;
  submittalType?: string;
  discipline?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export function useSubmittals(filters: SubmittalFilters) {
  const params = new URLSearchParams();
  params.set("projectId", filters.projectId);
  if (filters.status) params.set("status", filters.status);
  if (filters.submittalType) params.set("submittalType", filters.submittalType);
  if (filters.discipline) params.set("discipline", filters.discipline);
  if (filters.search) params.set("search", filters.search);
  params.set("page", String(filters.page ?? 1));
  params.set("pageSize", String(filters.pageSize ?? 8));

  return useQuery({
    queryKey: ["submittals", filters],
    queryFn: () => fetcher<SubmittalListResponse>(`/api/submittals?${params.toString()}`),
    placeholderData: (prev) => prev,
  });
}

export function useSubmittalStats(projectId: string) {
  return useQuery({
    queryKey: ["submittal-stats", projectId],
    queryFn: () => fetcher<SubmittalStatsResponse>(`/api/submittals/stats?projectId=${projectId}`),
  });
}
