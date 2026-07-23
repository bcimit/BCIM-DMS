"use client";

import { FileCheck2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SubmittalStatusBadge, SubmittalTypeBadge } from "@/components/submittals/submittal-badges";
import { formatDate } from "@/lib/format";
import type { SubmittalListItem } from "@/types/submittal";

function isOverdue(submittal: SubmittalListItem) {
  return (
    ["DRAFT", "SUBMITTED", "UNDER_REVIEW"].includes(submittal.status) &&
    new Date(submittal.dueDate).getTime() < Date.now()
  );
}

export function SubmittalTable({
  submittals,
  isLoading,
  onRowClick,
}: {
  submittals: SubmittalListItem[];
  isLoading: boolean;
  onRowClick: (submittal: SubmittalListItem) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="min-w-[280px]">Subject</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Discipline</TableHead>
          <TableHead>Revision</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted By</TableHead>
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

        {!isLoading && submittals.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground whitespace-normal">
              No submittals found.
            </TableCell>
          </TableRow>
        )}

        {!isLoading &&
          submittals.map((submittal) => (
            <TableRow key={submittal.id} className="cursor-pointer" onClick={() => onRowClick(submittal)}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <FileCheck2 className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate max-w-[320px]">{submittal.subject}</p>
                    <p className="text-xs text-muted-foreground">{submittal.submittalNo}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <SubmittalTypeBadge submittalType={submittal.submittalType} />
              </TableCell>
              <TableCell className="text-muted-foreground capitalize">
                {submittal.discipline.toLowerCase().replaceAll("_", " ")}
              </TableCell>
              <TableCell className="text-muted-foreground">{submittal.revision}</TableCell>
              <TableCell>
                <SubmittalStatusBadge status={submittal.status} overdue={isOverdue(submittal)} />
              </TableCell>
              <TableCell className="text-muted-foreground">{submittal.submittedBy.name}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(submittal.dueDate)}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
