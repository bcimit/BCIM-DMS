"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { X, Download, Eye, ChevronDown, FileStack, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DocIcon, docTypeLabel } from "@/components/documents/doc-icon";
import { StatusBadge } from "@/components/documents/status-badge";
import { useDocument } from "@/hooks/use-document";
import { formatBytes, formatDateTime } from "@/lib/format";
import { OfficePreview } from "@/components/documents/office-preview";
import { ShareDocumentDialog } from "@/components/documents/share-document-dialog";
import { EditDocumentDialog } from "@/components/documents/edit-document-dialog";
import { MoveDocumentDialog } from "@/components/documents/move-document-dialog";
import { WorkflowDialog } from "@/components/documents/workflow-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PdfPreview = dynamic(
  () => import("@/components/documents/pdf-preview").then((mod) => mod.PdfPreview),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border bg-muted/40 aspect-[4/3] flex items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    ),
  }
);

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right truncate">{value}</span>
    </div>
  );
}

export function DocumentDetailPanel({
  documentId,
  onClose,
}: {
  documentId: string | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useDocument(documentId);
  const doc = data?.data;
  const queryClient = useQueryClient();
  const [dialog, setDialog] = React.useState<"share" | "edit" | "move" | "workflow" | null>(null);

  async function handleDelete() {
    if (!documentId) return;
    const res = await fetch(`/api/documents/${documentId}/delete`, { method: "POST" });
    if (!res.ok) {
      toast.error("Failed to delete document");
      return;
    }
    toast.success(`"${doc?.name}" moved to Recycle Bin`);
    queryClient.invalidateQueries({ queryKey: ["documents"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    queryClient.invalidateQueries({ queryKey: ["activities"] });
    onClose();
  }

  return (
    <AnimatePresence>
      {documentId && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 360, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="shrink-0 overflow-hidden"
        >
          <div className="glass-panel-lg rounded-2xl w-[360px] h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60">
              <h3 className="text-sm font-semibold">Document Details</h3>
              <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close panel">
                <X className="size-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {isLoading || !doc ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <DocIcon fileName={doc.name} className="size-11" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm leading-tight truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{docTypeLabel(doc.name)} Document</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      Details
                    </p>
                    <div className="divide-y divide-border/60">
                      <DetailRow label="Discipline" value={doc.discipline.replaceAll("_", " ")} />
                      <DetailRow label="Type" value={doc.type.replaceAll("_", " ")} />
                      <DetailRow label="Version" value={doc.version} />
                      <DetailRow label="Status" value={<StatusBadge status={doc.status} />} />
                      <DetailRow label="Size" value={formatBytes(doc.sizeBytes)} />
                      <DetailRow label="Uploaded By" value={doc.uploadedBy.name} />
                      <DetailRow label="Uploaded On" value={formatDateTime(doc.createdAt)} />
                      {doc.category && <DetailRow label="Category" value={doc.category.name} />}
                      {doc.building && <DetailRow label="Building" value={doc.building} />}
                      {doc.floor && <DetailRow label="Floor" value={doc.floor} />}
                    </div>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{doc.description}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Preview
                    </p>
                    {doc.name.toLowerCase().endsWith(".pdf") ? (
                      <PdfPreview
                        fileUrl={doc.storageItemId ? `/api/documents/${doc.id}/content` : doc.fileUrl}
                      />
                    ) : doc.storageItemId ? (
                      <OfficePreview documentId={doc.id} />
                    ) : (
                      <div className="rounded-xl border border-border bg-muted/40 aspect-[4/3] flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <DocIcon fileName={doc.name} className="size-12" />
                        <p className="text-xs">No inline preview for this file type</p>
                      </div>
                    )}
                  </div>

                  {doc.versions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                        <FileStack className="size-3.5" /> Version History
                      </p>
                      <div className="space-y-1.5">
                        {doc.versions.slice(0, 3).map((v) => (
                          <div key={v.id} className="flex items-center justify-between text-xs rounded-lg bg-muted/40 px-2.5 py-1.5">
                            <span className="font-medium">{v.version}</span>
                            <span className="text-muted-foreground">{formatDateTime(v.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {doc && (
              <div className="flex items-center gap-2 p-4 border-t border-border/60">
                <Button className="flex-1" variant="default" asChild>
                  <a
                    href={doc.storageItemId ? `/api/documents/${doc.id}/content` : doc.fileUrl}
                    download={doc.name}
                  >
                    <Download className="size-4" /> Download
                  </a>
                </Button>
                <Button className="flex-1" variant="outline" asChild>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Eye className="size-4" /> View
                  </a>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <ChevronDown className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setDialog("share")}>Share</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setDialog("edit")}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setDialog("move")}>Move</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setDialog("workflow")}>Workflow</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onSelect={handleDelete}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </motion.aside>
      )}

      {doc && (
        <>
          <ShareDocumentDialog open={dialog === "share"} onOpenChange={(v) => setDialog(v ? "share" : null)} documentId={doc.id} />
          <EditDocumentDialog open={dialog === "edit"} onOpenChange={(v) => setDialog(v ? "edit" : null)} documentId={doc.id} />
          <MoveDocumentDialog
            open={dialog === "move"}
            onOpenChange={(v) => setDialog(v ? "move" : null)}
            projectId={doc.project.id}
            documentIds={[doc.id]}
            mode="move"
          />
          <WorkflowDialog open={dialog === "workflow"} onOpenChange={(v) => setDialog(v ? "workflow" : null)} documentId={doc.id} />
        </>
      )}
    </AnimatePresence>
  );
}
