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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RowActionsMenu({ onPreview }: { onPreview: () => void }) {
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
        <DropdownMenuItem className="text-destructive">
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
