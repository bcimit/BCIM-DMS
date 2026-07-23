import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { ActivityItem } from "@/types/document";

export function useActivities(projectId?: string, limit = 8) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (projectId) params.set("projectId", projectId);

  return useQuery({
    queryKey: ["activities", projectId ?? "all", limit],
    queryFn: () => fetcher<{ data: ActivityItem[] }>(`/api/activities?${params.toString()}`),
  });
}
