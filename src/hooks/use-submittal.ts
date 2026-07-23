import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { SubmittalDetail } from "@/types/submittal";

export function useSubmittal(id: string | null) {
  return useQuery({
    queryKey: ["submittal", id],
    queryFn: () => fetcher<{ data: SubmittalDetail }>(`/api/submittals/${id}`),
    enabled: !!id,
  });
}
