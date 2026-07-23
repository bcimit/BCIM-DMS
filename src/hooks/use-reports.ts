import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

export type ReportsResponse = {
  byDiscipline: { discipline: string; count: number }[];
  byType: { type: string; count: number }[];
};

export function useReports(projectId: string) {
  return useQuery({
    queryKey: ["reports", projectId],
    queryFn: () => fetcher<ReportsResponse>(`/api/reports?projectId=${projectId}`),
  });
}
