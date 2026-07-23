"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useStats } from "@/hooks/use-stats";

const STATUS_META: Record<string, { label: string; color: string }> = {
  APPROVED: { label: "Approved", color: "#10b981" },
  UNDER_REVIEW: { label: "Under Review", color: "#f59e0b" },
  DRAFT: { label: "Draft", color: "#9ca3af" },
  REJECTED: { label: "Rejected", color: "#ef4444" },
  SUBMITTED: { label: "Submitted", color: "#3b82f6" },
  REVIEWED: { label: "Reviewed", color: "#06b6d4" },
  ARCHIVED: { label: "Archived", color: "#6b7280" },
  CANCELLED: { label: "Cancelled", color: "#6b7280" },
};

const ORDER = ["APPROVED", "UNDER_REVIEW", "DRAFT", "REJECTED", "SUBMITTED", "REVIEWED"];

export function StatusDonut({ projectId }: { projectId?: string }) {
  const { data, isLoading } = useStats(projectId);

  if (isLoading || !data) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  const total = data.statusBreakdown.reduce((sum, s) => sum + s.count, 0) || 1;
  const chartData = [...data.statusBreakdown].sort(
    (a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status)
  );

  return (
    <div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={62}
              outerRadius={90}
              paddingAngle={2}
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_META[entry.status]?.color ?? "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, entry) => {
                const num = Number(value) || 0;
                const status = (entry?.payload as { status?: string } | undefined)?.status;
                return [
                  `${num} (${Math.round((num / total) * 100)}%)`,
                  (status && STATUS_META[status]?.label) ?? status ?? "",
                ];
              }}
              contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
        {chartData.map((s) => (
          <div key={s.status} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: STATUS_META[s.status]?.color ?? "#94a3b8" }}
            />
            <span className="text-muted-foreground truncate">
              {STATUS_META[s.status]?.label ?? s.status}
            </span>
            <span className="ml-auto font-medium">
              {s.count} ({Math.round((s.count / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
