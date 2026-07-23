"use client";

import { FolderPlus, Upload, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}: {
  onUpload: () => void;
  onCreateFolder: () => void;
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
          <Button variant="outline" size="icon" aria-label="More actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Import</DropdownMenuItem>
          <DropdownMenuItem>Export</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Bulk Upload</DropdownMenuItem>
          <DropdownMenuItem>Bulk Download</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Move</DropdownMenuItem>
          <DropdownMenuItem>Copy</DropdownMenuItem>
          <DropdownMenuItem>Archive</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
