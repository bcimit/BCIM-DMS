"use client";

import { FileCheck2, Clock, CheckCircle2, RefreshCcw, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/documents/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubmittalStats } from "@/hooks/use-submittals";

export function SubmittalKpiRow({ projectId }: { projectId: string }) {
  const { data, isLoading } = useSubmittalStats(projectId);

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[132px] rounded-2xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Submittals",
      value: data.total,
      icon: FileCheck2,
      iconClassName: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      sparklineColor: "#3b82f6",
    },
    {
      title: "Pending Review",
      value: data.pending,
      icon: Clock,
      iconClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      sparklineColor: "#f59e0b",
    },
    {
      title: "Approved",
      value: data.approved,
      icon: CheckCircle2,
      iconClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      sparklineColor: "#10b981",
    },
    {
      title: "Revise & Resubmit",
      value: data.reviseResubmit,
      icon: RefreshCcw,
      iconClassName: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      sparklineColor: "#fb923c",
    },
    {
      title: "Overdue",
      value: data.overdue,
      icon: AlertTriangle,
      iconClassName: "bg-red-500/10 text-red-600 dark:text-red-400",
      sparklineColor: "#ef4444",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((c) => (
        <KpiCard key={c.title} {...c} />
      ))}
    </div>
  );
}
