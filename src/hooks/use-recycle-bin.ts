import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { DocumentListResponse } from "@/types/document";

export function useRecycleBin(projectId: string, page = 1) {
  const params = new URLSearchParams({
    projectId,
    deleted: "true",
    page: String(page),
    pageSize: "10",
  });

  return useQuery({
    queryKey: ["recycle-bin", projectId, page],
    queryFn: () => fetcher<DocumentListResponse>(`/api/documents?${params.toString()}`),
  });
}
