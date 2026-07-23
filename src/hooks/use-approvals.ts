import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { ApprovalQueueItem } from "@/app/api/approvals/route";

export function useApprovals(projectId: string) {
  return useQuery({
    queryKey: ["approvals", projectId],
    queryFn: () => fetcher<{ data: ApprovalQueueItem[] }>(`/api/approvals?projectId=${projectId}`),
  });
}
