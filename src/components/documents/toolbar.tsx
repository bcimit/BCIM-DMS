"use client";

import { FolderPlus, Upload, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DocumentToolbar({
  onUpload,
  onCreateFolder,
  onExport,
  onBulkDownload,
  onMove,
  onCopy,
  onArchive,
  onDelete,
  selectionCount,
}: {
  onUpload: () => void;
  onCreateFolder: () => void;
  onExport: () => void;
  onBulkDownload: () => void;
  onMove: () => void;
  onCopy: () => void;
  onArchive: () => void;
  onDelete: () => void;
  selectionCount: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={onCreateFolder}>
        <FolderPlus className="size-4" />
        New Folder
      </Button>
      <Button
        onClick={onUpload}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-950/20"
      >
        <Upload className="size-4" />
        Upload
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative" aria-label="More actions">
            <MoreHorizontal className="size-4" />
            {selectionCount > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 h-4.5 min-w-4.5 justify-center rounded-full bg-blue-600 px-1 text-[10px] text-white">
                {selectionCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onExport}>Export filtered list (CSV)</DropdownMenuItem>
          <DropdownMenuItem onSelect={onBulkDownload}>Download selected ({selectionCount})</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onMove}>Move selected</DropdownMenuItem>
          <DropdownMenuItem onSelect={onCopy}>Copy selected</DropdownMenuItem>
          <DropdownMenuItem onSelect={onArchive}>Archive selected</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onSelect={onDelete}>
            Delete selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
