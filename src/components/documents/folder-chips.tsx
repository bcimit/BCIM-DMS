"use client";

import { Folder } from "lucide-react";
import type { FolderChild } from "@/types/document";

export function FolderChips({
  folders,
  onOpen,
}: {
  folders: FolderChild[];
  onOpen: (id: string) => void;
}) {
  if (folders.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {folders.map((f) => (
        <button
          key={f.id}
          onClick={() => onOpen(f.id)}
          className="group flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 hover-lift"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Folder className="size-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium group-hover:text-primary transition-colors">{f.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {f._count.children} folders · {f._count.documents} files
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
