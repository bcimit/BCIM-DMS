"use client";

import { FileStack, MessageCircleQuestion, FileCheck2, Layers } from "lucide-react";
import { KpiCard } from "@/components/documents/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApprovalQueueTable } from "@/components/approvals/approval-queue-table";
import { useApprovals } from "@/hooks/use-approvals";

export function ApprovalsBoard({ projectId }: { projectId: string }) {
  const { data, isLoading } = useApprovals(projectId);
  const items = data?.data ?? [];

  const counts = {
    total: items.length,
    documents: items.filter((i) => i.kind === "document").length,
    rfis: items.filter((i) => i.kind === "rfi").length,
    submittals: items.filter((i) => i.kind === "submittal").length,
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[132px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            title="Total Pending"
            value={counts.total}
            icon={Layers}
            iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
            sparklineColor="#8b5cf6"
          />
          <KpiCard
            title="Documents"
            value={counts.documents}
            icon={FileStack}
            iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            sparklineColor="#3b82f6"
          />
          <KpiCard
            title="RFIs"
            value={counts.rfis}
            icon={MessageCircleQuestion}
            iconClassName="bg-orange-500/10 text-orange-600 dark:text-orange-400"
            sparklineColor="#fb923c"
          />
          <KpiCard
            title="Submittals"
            value={counts.submittals}
            icon={FileCheck2}
            iconClassName="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
            sparklineColor="#06b6d4"
          />
        </div>
      )}

      <div className="glass-panel rounded-2xl p-4 lg:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Pending Approvals</h2>
          <p className="text-sm text-muted-foreground">
            Documents, RFIs, and submittals awaiting review across this project
          </p>
        </div>
        <ApprovalQueueTable items={items} isLoading={isLoading} />
      </div>
    </div>
  );
}
