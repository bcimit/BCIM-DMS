import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { NotificationItem } from "@/app/api/notifications/route";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetcher<{ data: NotificationItem[] }>("/api/notifications"),
    refetchInterval: 60_000,
  });
}
