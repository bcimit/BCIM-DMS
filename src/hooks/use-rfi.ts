import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { RfiDetail } from "@/types/rfi";

export function useRfi(id: string | null) {
  return useQuery({
    queryKey: ["rfi", id],
    queryFn: () => fetcher<{ data: RfiDetail }>(`/api/rfis/${id}`),
    enabled: !!id,
  });
}
