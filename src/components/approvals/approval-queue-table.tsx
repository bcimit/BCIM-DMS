"use client";

import Link from "next/link";
import { FileStack, MessageCircleQuestion, FileCheck2, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/documents/status-badge";
import { timeAgo } from "@/lib/format";
import type { ApprovalQueueItem } from "@/app/api/approvals/route";

const KIND_META: Record<ApprovalQueueItem["kind"], { icon: typeof FileStack; label: string; className: string }> = {
  document: { icon: FileStack, label: "Document", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  rfi: { icon: MessageCircleQuestion, label: "RFI", className: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  submittal: { icon: FileCheck2, label: "Submittal", className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
};

export function ApprovalQueueTable({ items, isLoading }: { items: ApprovalQueueItem[]; isLoading: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="min-w-[280px]">Item</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Raised</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={5}>
                <Skeleton className="h-10 w-full" />
              </TableCell>
            </TableRow>
          ))}

        {!isLoading && items.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground whitespace-normal">
              Nothing pending approval right now.
            </TableCell>
          </TableRow>
        )}

        {!isLoading &&
          items.map((item) => {
            const meta = KIND_META[item.kind];
            const Icon = meta.icon;
            return (
              <TableRow key={`${item.kind}-${item.id}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.className}`}>
                      <Icon className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate max-w-[320px]">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{meta.label}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{timeAgo(item.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={item.href}>
                      Review <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}
