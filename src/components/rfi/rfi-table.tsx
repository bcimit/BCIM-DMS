"use client";

import { MessageCircleQuestion } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RfiPriorityBadge, RfiStatusBadge } from "@/components/rfi/rfi-badges";
import { formatDate } from "@/lib/format";
import type { RfiListItem } from "@/types/rfi";

function isOverdue(rfi: RfiListItem) {
  return rfi.status !== "CLOSED" && new Date(rfi.dueDate).getTime() < Date.now();
}

export function RfiTable({
  rfis,
  isLoading,
  onRowClick,
}: {
  rfis: RfiListItem[];
  isLoading: boolean;
  onRowClick: (rfi: RfiListItem) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="min-w-[280px]">Subject</TableHead>
          <TableHead>Discipline</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Raised By</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Due Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={7}>
                <Skeleton className="h-10 w-full" />
              </TableCell>
            </TableRow>
          ))}

        {!isLoading && rfis.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground whitespace-normal">
              No RFIs found.
            </TableCell>
          </TableRow>
        )}

        {!isLoading &&
          rfis.map((rfi) => (
            <TableRow key={rfi.id} className="cursor-pointer" onClick={() => onRowClick(rfi)}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <MessageCircleQuestion className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate max-w-[320px]">{rfi.subject}</p>
                    <p className="text-xs text-muted-foreground">{rfi.rfiNo}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground capitalize">
                {rfi.discipline.toLowerCase().replaceAll("_", " ")}
              </TableCell>
              <TableCell>
                <RfiPriorityBadge priority={rfi.priority} />
              </TableCell>
              <TableCell>
                <RfiStatusBadge status={rfi.status} overdue={isOverdue(rfi)} />
              </TableCell>
              <TableCell className="text-muted-foreground">{rfi.raisedBy.name}</TableCell>
              <TableCell className="text-muted-foreground">{rfi.assignedTo?.name ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(rfi.dueDate)}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
