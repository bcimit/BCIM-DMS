import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

export type FlatFolder = { id: string; name: string; path: string };

export function useAllFolders(projectId: string) {
  return useQuery({
    queryKey: ["folders", projectId, "all"],
    queryFn: () => fetcher<{ data: FlatFolder[] }>(`/api/folders?projectId=${projectId}&all=true`),
    enabled: !!projectId,
  });
}
