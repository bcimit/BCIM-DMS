"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useStats } from "@/hooks/use-stats";

export function DocumentTrendChart({ projectId }: { projectId?: string }) {
  const { data, isLoading } = useStats(projectId);

  if (isLoading || !data) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  const chartData = data.trend.map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    Uploaded: t.uploaded,
    Approved: t.approved,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10 }}>
          <defs>
            <linearGradient id="uploadedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
          <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} className="fill-muted-foreground" />
          <YAxis fontSize={11} tickLine={false} axisLine={false} className="fill-muted-foreground" />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
          <Legend iconType="circle" iconSize={8} />
          <Area type="monotone" dataKey="Uploaded" stroke="#3b82f6" fill="url(#uploadedGradient)" strokeWidth={2} />
          <Area type="monotone" dataKey="Approved" stroke="#10b981" fill="url(#approvedGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
