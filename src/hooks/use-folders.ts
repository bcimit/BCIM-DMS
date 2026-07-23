import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { FoldersResponse } from "@/types/document";

export function useFolders(projectId: string, folderId?: string | null) {
  const params = new URLSearchParams({ projectId });
  if (folderId) params.set("folderId", folderId);

  return useQuery({
    queryKey: ["folders", projectId, folderId ?? null],
    queryFn: () => fetcher<FoldersResponse>(`/api/folders?${params.toString()}`),
  });
}
