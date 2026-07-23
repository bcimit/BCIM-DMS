"use client";

import * as React from "react";
import {
  Eye,
  Download,
  Share2,
  Pencil,
  FolderInput,
  History,
  Workflow,
  ShieldCheck,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditDocumentDialog } from "@/components/documents/edit-document-dialog";
import { MoveDocumentDialog } from "@/components/documents/move-document-dialog";
import { VersionHistoryDialog } from "@/components/documents/version-history-dialog";
import { WorkflowDialog } from "@/components/documents/workflow-dialog";
import { ApprovalHistoryDialog } from "@/components/documents/approval-history-dialog";
import { ShareDocumentDialog } from "@/components/documents/share-document-dialog";

type DialogKind = "edit" | "move" | "versions" | "workflow" | "approvals" | "share" | null;

export function RowActionsMenu({
  onPreview,
  documentId,
  documentName,
  projectId,
}: {
  onPreview: () => void;
  documentId: string;
  documentName: string;
  projectId: string;
}) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = React.useState<DialogKind>(null);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/documents/${documentId}/delete`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to delete document");
    },
    onSuccess: () => {
      toast.success(`"${documentName}" moved to Recycle Bin`);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: () => toast.error("Failed to delete document"),
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Row actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onSelect={onPreview}>
            <Eye /> Preview
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`/api/documents/${documentId}/content`} download>
              <Download /> Download
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("share")}>
            <Share2 /> Share
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("edit")}>
            <Pencil /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("move")}>
            <FolderInput /> Move
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setDialog("versions")}>
            <History /> Version History
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("workflow")}>
            <Workflow /> Workflow
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("approvals")}>
            <ShieldCheck /> Approval History
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onSelect={() => deleteMutation.mutate()}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditDocumentDialog open={dialog === "edit"} onOpenChange={(v) => setDialog(v ? "edit" : null)} documentId={documentId} />
      <MoveDocumentDialog
        open={dialog === "move"}
        onOpenChange={(v) => setDialog(v ? "move" : null)}
        projectId={projectId}
        documentIds={[documentId]}
        mode="move"
      />
      <VersionHistoryDialog open={dialog === "versions"} onOpenChange={(v) => setDialog(v ? "versions" : null)} documentId={documentId} />
      <WorkflowDialog open={dialog === "workflow"} onOpenChange={(v) => setDialog(v ? "workflow" : null)} documentId={documentId} />
      <ApprovalHistoryDialog open={dialog === "approvals"} onOpenChange={(v) => setDialog(v ? "approvals" : null)} documentId={documentId} />
      <ShareDocumentDialog open={dialog === "share"} onOpenChange={(v) => setDialog(v ? "share" : null)} documentId={documentId} />
    </>
  );
}
