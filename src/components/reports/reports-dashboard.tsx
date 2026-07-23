"use client";

import { FileStack, MessageCircleQuestion, FileCheck2, CheckCircle2 } from "lucide-react";
import { KpiCard } from "@/components/documents/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusDonut } from "@/components/documents/status-donut";
import { DocumentTrendChart } from "@/components/documents/document-trend-chart";
import { RecentActivities } from "@/components/documents/recent-activities";
import { ReportBarChart } from "@/components/reports/report-bar-chart";
import { useStats } from "@/hooks/use-stats";
import { useRfiStats } from "@/hooks/use-rfis";
import { useSubmittalStats } from "@/hooks/use-submittals";
import { useReports } from "@/hooks/use-reports";

export function ReportsDashboard({ projectId }: { projectId: string }) {
  const { data: stats, isLoading: statsLoading } = useStats(projectId);
  const { data: rfiStats } = useRfiStats(projectId);
  const { data: submittalStats } = useSubmittalStats(projectId);
  const { data: reports, isLoading: reportsLoading } = useReports(projectId);

  return (
    <div className="space-y-4">
      {statsLoading || !stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[132px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            title="Total Documents"
            value={stats.totals.documents}
            icon={FileStack}
            iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            sparklineColor="#3b82f6"
          />
          <KpiCard
            title="Total RFIs"
            value={rfiStats?.total ?? 0}
            icon={MessageCircleQuestion}
            iconClassName="bg-orange-500/10 text-orange-600 dark:text-orange-400"
            sparklineColor="#fb923c"
          />
          <KpiCard
            title="Total Submittals"
            value={submittalStats?.total ?? 0}
            icon={FileCheck2}
            iconClassName="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
            sparklineColor="#06b6d4"
          />
          <KpiCard
            title="Approved Documents"
            value={stats.totals.approved}
            icon={CheckCircle2}
            iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            sparklineColor="#10b981"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Document Status Overview</h3>
          <StatusDonut projectId={projectId} />
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Document Trend</h3>
          <DocumentTrendChart projectId={projectId} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Documents by Discipline</h3>
          <ReportBarChart data={reports?.byDiscipline} isLoading={reportsLoading} dataKey="discipline" />
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Documents by Type</h3>
          <ReportBarChart data={reports?.byType} isLoading={reportsLoading} dataKey="type" />
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4">Recent Activities</h3>
        <RecentActivities projectId={projectId} limit={8} />
      </div>
    </div>
  );
}
