import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { ProjectSummary } from "@/types/document";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => fetcher<{ data: ProjectSummary[] }>("/api/projects"),
  });
}
