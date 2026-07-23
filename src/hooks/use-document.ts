import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

export type DocumentDetail = {
  id: string;
  documentNo: string;
  name: string;
  description: string | null;
  type: string;
  discipline: string;
  status: string;
  version: string;
  building: string | null;
  floor: string | null;
  area: string | null;
  sizeBytes: number;
  fileUrl: string;
  storageItemId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  uploadedBy: { id: string; name: string; avatarUrl: string | null };
  category: { name: string } | null;
  folder: { id: string; name: string; path: string } | null;
  project: { id: string; name: string };
  versions: {
    id: string;
    version: string;
    isMajor: boolean;
    notes: string | null;
    sizeBytes: number;
    createdAt: string;
  }[];
  approvals: {
    id: string;
    status: string;
    comment: string | null;
    createdAt: string;
    actor: { name: string };
  }[];
};

export function useDocument(id: string | null) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () => fetcher<{ data: DocumentDetail }>(`/api/documents/${id}`),
    enabled: !!id,
  });
}
