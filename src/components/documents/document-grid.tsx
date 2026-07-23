"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { DocIcon } from "@/components/documents/doc-icon";
import { StatusBadge } from "@/components/documents/status-badge";
import { RowActionsMenu } from "@/components/documents/row-actions-menu";
import { formatBytes } from "@/lib/format";
import type { DocumentListItem } from "@/types/document";

export function DocumentGrid({
  documents,
  isLoading,
  onCardClick,
}: {
  documents: DocumentListItem[];
  isLoading: boolean;
  onCardClick: (doc: DocumentListItem) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No documents found in this folder.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          role="button"
          tabIndex={0}
          onClick={() => onCardClick(doc)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onCardClick(doc)}
          className="group text-left rounded-xl border border-border bg-card p-4 hover-lift flex flex-col gap-3 cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <DocIcon fileName={doc.name} className="size-11" />
            <RowActionsMenu onPreview={() => onCardClick(doc)} documentId={doc.id} documentName={doc.name} projectId={doc.projectId} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{doc.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(doc.sizeBytes)} · {doc.version}</p>
          </div>
          <StatusBadge status={doc.status} />
        </div>
      ))}
    </div>
  );
}
