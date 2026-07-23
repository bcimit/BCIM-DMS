"use client";

import { useQuery } from "@tanstack/react-query";
import { FileWarning, Loader2 } from "lucide-react";
import { fetcher } from "@/lib/fetcher";

export function OfficePreview({ documentId }: { documentId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["preview-embed", documentId],
    queryFn: () => fetcher<{ url: string }>(`/api/documents/${documentId}/preview-embed`),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-muted/40 aspect-[4/3] flex items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (isError || !data?.url) {
    return (
      <div className="rounded-xl border border-border bg-muted/40 aspect-[4/3] flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <FileWarning className="size-8" />
        <p className="text-xs px-4 text-center">Preview unavailable</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden aspect-[4/3]">
      <iframe src={data.url} className="w-full h-full" title="Document preview" />
    </div>
  );
}
