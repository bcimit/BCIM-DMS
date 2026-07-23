import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

export type UserSummary = { id: string; name: string; role: string };

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => fetcher<{ data: UserSummary[] }>("/api/users"),
  });
}
