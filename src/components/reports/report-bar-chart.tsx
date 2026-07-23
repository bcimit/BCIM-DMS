"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

function labelize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function ReportBarChart({
  data,
  isLoading,
  dataKey,
}: {
  data: { count: number; [key: string]: string | number }[] | undefined;
  isLoading: boolean;
  dataKey: string;
}) {
  if (isLoading || !data) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  const chartData = data.map((d) => ({ ...d, label: labelize(String(d[dataKey])) }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ left: -20, right: 10, top: 10 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
          <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} className="fill-muted-foreground" />
          <YAxis
            type="category"
            dataKey="label"
            width={110}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            className="fill-muted-foreground"
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
