"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DocIcon } from "@/components/documents/doc-icon";
import { formatBytes, formatDateTime } from "@/lib/format";
import type { DocumentListItem } from "@/types/document";

export function RecycleBinTable({
  documents,
  isLoading,
  isAdmin,
}: {
  documents: DocumentListItem[];
  isLoading: boolean;
  isAdmin: boolean;
}) {
  const queryClient = useQueryClient();

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/documents/${id}/restore`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to restore");
    },
    onSuccess: () => {
      toast.success("Document restored");
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: () => toast.error("Failed to restore document"),
  });

  const purgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to permanently delete");
    },
    onSuccess: () => {
      toast.success("Document permanently deleted");
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
    },
    onError: () => toast.error("Failed to permanently delete document"),
  });

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="min-w-[280px]">Name</TableHead>
          <TableHead>Discipline</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Deleted On</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={5}>
                <Skeleton className="h-10 w-full" />
              </TableCell>
            </TableRow>
          ))}

        {!isLoading && documents.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground whitespace-normal">
              Recycle Bin is empty.
            </TableCell>
          </TableRow>
        )}

        {!isLoading &&
          documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <DocIcon fileName={doc.name} />
                  <p className="font-medium text-foreground truncate max-w-[280px]">{doc.name}</p>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground capitalize">
                {doc.discipline.toLowerCase().replaceAll("_", " ")}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatBytes(doc.sizeBytes)}</TableCell>
              <TableCell className="text-muted-foreground">
                {doc.deletedAt ? formatDateTime(doc.deletedAt) : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={restoreMutation.isPending}
                    onClick={() => restoreMutation.mutate(doc.id)}
                  >
                    <RotateCcw className="size-3.5" /> Restore
                  </Button>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      disabled={purgeMutation.isPending}
                      onClick={() => {
                        if (confirm(`Permanently delete "${doc.name}"? This cannot be undone.`)) {
                          purgeMutation.mutate(doc.id);
                        }
                      }}
                    >
                      <Trash2 className="size-3.5" /> Delete Forever
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
