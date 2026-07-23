"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Check, X } from "lucide-react";
import { useDocument } from "@/hooks/use-document";
import { StatusBadge } from "@/components/documents/status-badge";
import { isAdminRole } from "@/lib/permissions";

function WorkflowForm({
  documentId,
  onOpenChange,
}: {
  documentId: string;
  onOpenChange: (v: boolean) => void;
}) {
  const { data } = useDocument(documentId);
  const doc = data!.data;
  const { data: session } = useSession();
  const isAdmin = isAdminRole(session?.user?.role);
  const [comment, setComment] = React.useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/documents/${documentId}/approvals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, comment: comment.trim() || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Action failed");
      }
    },
    onSuccess: (_, status) => {
      toast.success(`Document ${status === "APPROVED" ? "approved" : status === "REJECTED" ? "rejected" : "submitted for review"}`);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canSubmit = doc.status === "DRAFT" || doc.status === "REJECTED";
  const canDecide = isAdmin && (doc.status === "SUBMITTED" || doc.status === "UNDER_REVIEW");

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5 text-sm">
          <span className="text-muted-foreground">Current status</span>
          <StatusBadge status={doc.status} />
        </div>

        <div className="space-y-1.5">
          <Label>Comment (optional)</Label>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Add a note…" />
        </div>

        {!canSubmit && !canDecide && (
          <p className="text-sm text-muted-foreground">
            No workflow action is available for this document&apos;s current status
            {!isAdmin && (doc.status === "SUBMITTED" || doc.status === "UNDER_REVIEW") ? " — only admins can approve or reject" : ""}.
          </p>
        )}
      </div>
      <DialogFooter className="flex-wrap gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
          Close
        </Button>
        {canSubmit && (
          <Button onClick={() => mutation.mutate("UNDER_REVIEW")} disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Submit for Review
          </Button>
        )}
        {canDecide && (
          <>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => mutation.mutate("REJECTED")}
              disabled={mutation.isPending}
            >
              <X className="size-4" /> Reject
            </Button>
            <Button onClick={() => mutation.mutate("APPROVED")} disabled={mutation.isPending}>
              <Check className="size-4" /> Approve
            </Button>
          </>
        )}
      </DialogFooter>
    </>
  );
}

export function WorkflowDialog({
  open,
  onOpenChange,
  documentId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  documentId: string | null;
}) {
  const { data, isLoading } = useDocument(open ? documentId : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approval Workflow</DialogTitle>
        </DialogHeader>
        {isLoading || !data || !documentId ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <WorkflowForm key={documentId} documentId={documentId} onOpenChange={onOpenChange} />
        )}
      </DialogContent>
    </Dialog>
  );
}
