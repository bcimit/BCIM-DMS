import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { DriveQuota } from "@/lib/graph";

export function useStorageQuota() {
  return useQuery({
    queryKey: ["storage-quota"],
    queryFn: () => fetcher<DriveQuota>("/api/storage-quota"),
    staleTime: 5 * 60_000,
    retry: false,
  });
}
