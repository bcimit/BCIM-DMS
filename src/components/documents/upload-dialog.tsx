"use client";

import * as React from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud, FileIcon, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DISCIPLINES } from "@/lib/constants";

type UploadStatus = "pending" | "uploading" | "done" | "error";

type UploadItem = {
  file: File;
  id: string;
  progress: number;
  status: UploadStatus;
  error?: string;
};

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "image/vnd.dwg": [".dwg"],
  "application/dxf": [".dxf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/tiff": [".tiff"],
  "video/mp4": [".mp4"],
  "application/zip": [".zip"],
};

async function uploadFile(
  file: File,
  projectId: string,
  folderId: string | null,
  discipline: string,
  forcedType: string | undefined,
  onProgress: (pct: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/documents/upload");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        let message = "Upload failed";
        try {
          message = JSON.parse(xhr.responseText).error ?? message;
        } catch {
          // ignore parse errors, use default message
        }
        reject(new Error(message));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", projectId);
    if (folderId) formData.append("folderId", folderId);
    formData.append("discipline", discipline);
    if (forcedType) formData.append("type", forcedType);
    xhr.send(formData);
  });
}

export function UploadDialog({
  open,
  onOpenChange,
  projectId,
  folderId,
  forcedType,
  forcedDiscipline,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  folderId: string | null;
  forcedType?: string;
  forcedDiscipline?: string;
}) {
  const [items, setItems] = React.useState<UploadItem[]>([]);
  const [discipline, setDiscipline] = React.useState<string | undefined>();
  const queryClient = useQueryClient();

  const onDrop = React.useCallback((accepted: File[], rejected: FileRejection[]) => {
    if (rejected.length > 0) {
      toast.error(`${rejected.length} file(s) rejected — unsupported format`);
    }
    const newItems: UploadItem[] = accepted.map((file) => ({
      file,
      id: `${file.name}-${file.size}-${Math.random()}`,
      progress: 0,
      status: "pending",
    }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: ACCEPTED });

  const hasFiles = items.length > 0;
  const allUploaded = hasFiles && items.every((i) => i.status === "done" || i.status === "error");
  const anyPending = items.some((i) => i.status === "pending");

  async function handleUploadAll() {
    const effectiveDiscipline = forcedDiscipline ?? discipline;
    if (!effectiveDiscipline) {
      toast.error("Select a discipline before uploading");
      return;
    }

    setItems((prev) => prev.map((it) => (it.status === "pending" ? { ...it, status: "uploading" } : it)));

    await Promise.all(
      items
        .filter((it) => it.status === "pending" || it.status === "uploading")
        .map(async (it) => {
          try {
            await uploadFile(it.file, projectId, folderId, effectiveDiscipline, forcedType, (pct) => {
              setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, progress: pct } : p)));
            });
            setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, status: "done", progress: 100 } : p)));
          } catch (e) {
            setItems((prev) =>
              prev.map((p) =>
                p.id === it.id ? { ...p, status: "error", error: e instanceof Error ? e.message : "Upload failed" } : p
              )
            );
          }
        })
    );

    queryClient.invalidateQueries({ queryKey: ["documents"] });
    queryClient.invalidateQueries({ queryKey: ["folders"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    queryClient.invalidateQueries({ queryKey: ["activities"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  }

  function handleClose(v: boolean) {
    if (!v) {
      setItems([]);
      setDiscipline(undefined);
    }
    onOpenChange(v);
  }

  function handleFinish() {
    const succeeded = items.filter((i) => i.status === "done").length;
    const failed = items.filter((i) => i.status === "error").length;
    if (succeeded > 0) {
      toast.success(`${succeeded} document${succeeded > 1 ? "s" : ""} uploaded successfully`);
    }
    if (failed > 0) {
      toast.error(`${failed} document${failed > 1 ? "s" : ""} failed to upload`);
    }
    handleClose(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>

        {!forcedDiscipline && (
        <div className="space-y-1.5">
          <Label htmlFor="upload-discipline">Discipline</Label>
          <Select value={discipline} onValueChange={setDiscipline}>
            <SelectTrigger id="upload-discipline" className="w-full">
              <SelectValue placeholder="Select discipline" />
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
        )}

        <div
          {...getRootProps()}
          className={cn(
            "rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud className="size-8 text-primary" />
          <p className="text-sm font-medium">Drag & drop files here, or click to browse</p>
          <p className="text-xs text-muted-foreground">
            PDF, DWG, DXF, DOCX, XLSX, PPTX, JPG, PNG, TIFF, MP4, ZIP
          </p>
        </div>

        {items.length > 0 && (
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted shrink-0">
                  <FileIcon className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{it.file.name}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{formatBytes(it.file.size)}</span>
                  </div>
                  {it.status === "error" ? (
                    <p className="text-xs text-destructive mt-1">{it.error}</p>
                  ) : (
                    <Progress value={it.progress} className="h-1.5 mt-1.5" />
                  )}
                </div>
                {it.status === "done" && <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />}
                {it.status === "error" && <AlertCircle className="size-4 text-destructive shrink-0" />}
                {it.status === "pending" && (
                  <button
                    onClick={() => setItems((prev) => prev.filter((p) => p.id !== it.id))}
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          {allUploaded ? (
            <Button
              onClick={handleFinish}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
            >
              Done
            </Button>
          ) : (
            <Button
              disabled={!hasFiles || !anyPending}
              onClick={handleUploadAll}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
            >
              Upload {items.length > 0 ? `(${items.length})` : ""}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
