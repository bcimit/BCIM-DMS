"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useDocument } from "@/hooks/use-document";
import { StatusBadge } from "@/components/documents/status-badge";
import { formatDateTime } from "@/lib/format";

export function ApprovalHistoryDialog({
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
          <DialogTitle>Approval History</DialogTitle>
        </DialogHeader>
        {isLoading || !doc ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : doc.approvals.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No approval activity yet.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {doc.approvals.map((a) => (
              <div key={a.id} className="rounded-lg border border-border px-3 py-2.5 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <StatusBadge status={a.status} />
                  <span className="text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</span>
                </div>
                <p className="text-xs text-muted-foreground">by {a.actor.name}</p>
                {a.comment && <p className="text-sm">{a.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
