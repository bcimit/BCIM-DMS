import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { StatsResponse } from "@/types/document";

export function useStats(projectId?: string) {
  return useQuery({
    queryKey: ["stats", projectId ?? "all"],
    queryFn: () => fetcher<StatsResponse>(`/api/stats${projectId ? `?projectId=${projectId}` : ""}`),
  });
}
