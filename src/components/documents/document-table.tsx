"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { DocIcon, docTypeLabel } from "@/components/documents/doc-icon";
import { StatusBadge } from "@/components/documents/status-badge";
import { RowActionsMenu } from "@/components/documents/row-actions-menu";
import { formatBytes, formatDate } from "@/lib/format";
import type { DocumentListItem } from "@/types/document";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DocumentTable({
  documents,
  isLoading,
  onRowClick,
}: {
  documents: DocumentListItem[];
  isLoading: boolean;
  onRowClick: (doc: DocumentListItem) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="min-w-[260px]">Name</TableHead>
          <TableHead>Discipline</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Modified By</TableHead>
          <TableHead>Modified On</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={8}>
                <Skeleton className="h-10 w-full" />
              </TableCell>
            </TableRow>
          ))}

        {!isLoading && documents.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="h-32 text-center text-muted-foreground whitespace-normal">
              No documents found in this folder.
            </TableCell>
          </TableRow>
        )}

        {!isLoading &&
          documents.map((doc) => (
            <TableRow key={doc.id} className="cursor-pointer" onClick={() => onRowClick(doc)}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <DocIcon fileName={doc.name} />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate max-w-[280px]">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{docTypeLabel(doc.name)} Document</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground capitalize">
                {doc.discipline.toLowerCase().replaceAll("_", " ")}
              </TableCell>
              <TableCell className="text-muted-foreground">{doc.version}</TableCell>
              <TableCell>
                <StatusBadge status={doc.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">{formatBytes(doc.sizeBytes)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px] bg-muted">
                      {initials(doc.uploadedBy.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground">{doc.uploadedBy.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(doc.updatedAt)}</TableCell>
              <TableCell className="text-right">
                <RowActionsMenu onPreview={() => onRowClick(doc)} documentId={doc.id} documentName={doc.name} />
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
