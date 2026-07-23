"use client";

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

export function RowActionsMenu({
  onPreview,
  documentId,
  documentName,
}: {
  onPreview: () => void;
  documentId: string;
  documentName: string;
}) {
  const queryClient = useQueryClient();

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
        <DropdownMenuItem>
          <Download /> Download
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Share2 /> Share
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pencil /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FolderInput /> Move
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <History /> Version History
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Workflow /> Workflow
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ShieldCheck /> Approval History
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onSelect={() => deleteMutation.mutate()}>
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
