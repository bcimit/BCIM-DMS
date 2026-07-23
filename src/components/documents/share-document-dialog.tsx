"use client";

import * as React from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Copy } from "lucide-react";

function ShareLinkContent({ documentId }: { documentId: string }) {
  const [url, setUrl] = React.useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/documents/${documentId}/share`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate share link");
      return res.json() as Promise<{ data: { url: string } }>;
    },
    onSuccess: (data) => setUrl(data.data.url),
    onError: () => toast.error("Failed to generate share link"),
  });

  const { mutate, isPending } = mutation;
  React.useEffect(() => {
    mutate();
  }, [mutate]);

  function copyLink() {
    if (!url) return;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  }

  if (isPending || !url) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input readOnly value={url} className="text-xs" />
      <Button size="icon" variant="outline" onClick={copyLink} aria-label="Copy link">
        <Copy className="size-4" />
      </Button>
    </div>
  );
}

export function ShareDocumentDialog({
  open,
  onOpenChange,
  documentId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  documentId: string | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
        </DialogHeader>
        {open && documentId && <ShareLinkContent key={documentId} documentId={documentId} />}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
