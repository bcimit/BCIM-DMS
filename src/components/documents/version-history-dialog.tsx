"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, FileStack } from "lucide-react";
import { useDocument } from "@/hooks/use-document";
import { formatBytes, formatDateTime } from "@/lib/format";

export function VersionHistoryDialog({
  open,
  onOpenChange,
  documentId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  documentId: string | null;
}) {
  const { data, isLoading } = useDocument(open ? documentId : null);
  const doc = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>
        {isLoading || !doc ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm">
              <div className="flex items-center gap-2">
                <FileStack className="size-4 text-muted-foreground" />
                <span className="font-medium">{doc.version}</span>
                <span className="text-xs text-muted-foreground">(current)</span>
              </div>
              <span className="text-xs text-muted-foreground">{formatBytes(doc.sizeBytes)}</span>
            </div>
            {doc.versions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No earlier versions. This document hasn&apos;t been re-uploaded as a new version yet.
              </p>
            ) : (
              doc.versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm">
                  <div>
                    <span className="font-medium">{v.version}</span>
                    {v.notes && <p className="text-xs text-muted-foreground">{v.notes}</p>}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{formatBytes(v.sizeBytes)}</p>
                    <p>{formatDateTime(v.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
