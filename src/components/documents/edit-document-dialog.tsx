"use client";

import * as React from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { DISCIPLINES, DOCUMENT_TYPES } from "@/lib/constants";
import { useDocument } from "@/hooks/use-document";

function EditForm({
  documentId,
  onOpenChange,
}: {
  documentId: string;
  onOpenChange: (v: boolean) => void;
}) {
  const { data } = useDocument(documentId);
  const doc = data!.data;
  const [name, setName] = React.useState(doc.name);
  const [description, setDescription] = React.useState(doc.description ?? "");
  const [discipline, setDiscipline] = React.useState(doc.discipline);
  const [type, setType] = React.useState(doc.type);
  const [building, setBuilding] = React.useState(doc.building ?? "");
  const [floor, setFloor] = React.useState(doc.floor ?? "");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          discipline,
          type,
          building: building.trim() || null,
          floor: floor.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => {
      toast.success("Document updated");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update document"),
  });

  return (
    <>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Discipline</Label>
            <Select value={discipline} onValueChange={setDiscipline}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISCIPLINES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Building</Label>
            <Input value={building} onChange={(e) => setBuilding(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Floor</Label>
            <Input value={floor} onChange={(e) => setFloor(e.target.value)} />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !name.trim()}>
          {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
          Save Changes
        </Button>
      </DialogFooter>
    </>
  );
}

export function EditDocumentDialog({
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
          <DialogTitle>Edit Document</DialogTitle>
        </DialogHeader>
        {isLoading || !data || !documentId ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <EditForm key={documentId} documentId={documentId} onOpenChange={onOpenChange} />
        )}
      </DialogContent>
    </Dialog>
  );
}
