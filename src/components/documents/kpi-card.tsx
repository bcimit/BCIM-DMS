"use client";

import * as React from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { AnimatedCounter } from "@/components/documents/animated-counter";
import { cn } from "@/lib/utils";

export function KpiCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  delta,
  sparkline,
  sparklineColor = "#3b82f6",
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  iconClassName: string;
  delta?: string;
  sparkline?: number[];
  sparklineColor?: string;
}) {
  const chartData = (sparkline && sparkline.length > 1 ? sparkline : [0, 0]).map((v, i) => ({ i, v }));

  return (
    <div className="glass-panel hover-lift rounded-2xl p-4 flex flex-col gap-3 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl shrink-0",
            iconClassName
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="h-8 w-20 shrink-0 opacity-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={sparklineColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold tracking-tight tabular-nums">
          <AnimatedCounter value={value} />
        </p>
        <p className="text-xs text-muted-foreground truncate">{title}</p>
      </div>
      {delta && (
        <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <ArrowUpRight className="size-3.5" />
          {delta}
        </div>
      )}
    </div>
  );
}
