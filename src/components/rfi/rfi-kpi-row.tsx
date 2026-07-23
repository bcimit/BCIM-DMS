"use client";

import { MessageCircleQuestion, CheckCircle2, ShieldCheck, AlertTriangle, FileStack } from "lucide-react";
import { KpiCard } from "@/components/documents/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRfiStats } from "@/hooks/use-rfis";

export function RfiKpiRow({ projectId }: { projectId: string }) {
  const { data, isLoading } = useRfiStats(projectId);

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
      title: "Total RFIs",
      value: data.total,
      icon: FileStack,
      iconClassName: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      sparklineColor: "#3b82f6",
    },
    {
      title: "Open",
      value: data.open,
      icon: MessageCircleQuestion,
      iconClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      sparklineColor: "#f59e0b",
    },
    {
      title: "Answered",
      value: data.answered,
      icon: ShieldCheck,
      iconClassName: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
      sparklineColor: "#06b6d4",
    },
    {
      title: "Closed",
      value: data.closed,
      icon: CheckCircle2,
      iconClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      sparklineColor: "#10b981",
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
