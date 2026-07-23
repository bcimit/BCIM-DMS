"use client";

import * as React from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useAllFolders } from "@/hooks/use-all-folders";

export function MoveDocumentDialog({
  open,
  onOpenChange,
  projectId,
  documentIds,
  mode = "move",
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  documentIds: string[];
  mode?: "move" | "copy";
  onDone?: () => void;
}) {
  const [folderId, setFolderId] = React.useState<string>("root");
  const queryClient = useQueryClient();
  const foldersQuery = useAllFolders(projectId);
  const folders = foldersQuery.data?.data ?? [];

  const mutation = useMutation({
    mutationFn: async () => {
      const destination = folderId === "root" ? null : folderId;
      const endpoint = (id: string) => (mode === "move" ? `/api/documents/${id}` : `/api/documents/${id}/copy`);
      const method = mode === "move" ? "PATCH" : "POST";
      await Promise.all(
        documentIds.map(async (id) => {
          const res = await fetch(endpoint(id), {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folderId: destination }),
          });
          if (!res.ok) throw new Error();
        })
      );
    },
    onSuccess: () => {
      toast.success(
        mode === "move"
          ? `${documentIds.length} document${documentIds.length > 1 ? "s" : ""} moved`
          : `${documentIds.length} document${documentIds.length > 1 ? "s" : ""} copied`
      );
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      onOpenChange(false);
      onDone?.();
    },
    onError: () => toast.error(mode === "move" ? "Failed to move document(s)" : "Failed to copy document(s)"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{mode === "move" ? "Move" : "Copy"} {documentIds.length > 1 ? `${documentIds.length} documents` : "document"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Destination folder</Label>
          <Select value={folderId} onValueChange={setFolderId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="root">/ (Project root)</SelectItem>
              {folders.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.path}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {mode === "move" ? "Move" : "Copy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
