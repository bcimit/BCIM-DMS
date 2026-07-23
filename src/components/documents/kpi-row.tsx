"use client";

import { FileText, Folder, PencilRuler, MessageCircleQuestion, FileCheck2, CheckCircle2 } from "lucide-react";
import { KpiCard } from "@/components/documents/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStats } from "@/hooks/use-stats";

export function KpiRow({ projectId }: { projectId?: string }) {
  const { data, isLoading } = useStats(projectId);

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[132px] rounded-2xl" />
        ))}
      </div>
    );
  }

  const uploadedSpark = data.trend.map((t) => t.uploaded);
  const approvedSpark = data.trend.map((t) => t.approved);
  const approvedPct = data.totals.documents ? Math.round((data.totals.approved / data.totals.documents) * 1000) / 10 : 0;

  const cards = [
    {
      title: "Total Documents",
      value: data.totals.documents,
      icon: FileText,
      iconClassName: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      delta: `+${data.monthDelta.documents} this month`,
      sparkline: uploadedSpark,
      sparklineColor: "#3b82f6",
    },
    {
      title: "Folders",
      value: data.totals.folders,
      icon: Folder,
      iconClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      delta: `+${data.monthDelta.folders} this month`,
      sparkline: uploadedSpark.map((v) => v * 0.4),
      sparklineColor: "#f59e0b",
    },
    {
      title: "Drawings",
      value: data.totals.drawings,
      icon: PencilRuler,
      iconClassName: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      delta: `+${data.monthDelta.drawings} this month`,
      sparkline: uploadedSpark.map((v) => v * 0.8),
      sparklineColor: "#8b5cf6",
    },
    {
      title: "RFI's",
      value: data.totals.rfis,
      icon: MessageCircleQuestion,
      iconClassName: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      delta: `+${data.monthDelta.rfis} this month`,
      sparkline: uploadedSpark.map((v) => v * 0.2),
      sparklineColor: "#fb923c",
    },
    {
      title: "Submittals",
      value: data.totals.submittals,
      icon: FileCheck2,
      iconClassName: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
      delta: `+${data.monthDelta.submittals} this month`,
      sparkline: uploadedSpark.map((v) => v * 0.3),
      sparklineColor: "#06b6d4",
    },
    {
      title: "Approved",
      value: data.totals.approved,
      icon: CheckCircle2,
      iconClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      delta: `${approvedPct}% of total`,
      sparkline: approvedSpark,
      sparklineColor: "#10b981",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c) => (
        <KpiCard key={c.title} {...c} />
      ))}
    </div>
  );
}
