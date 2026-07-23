"use client";

import { CheckCircle2, Upload, XCircle, MessageSquare, History, Trash2, FolderInput } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivities } from "@/hooks/use-activities";
import { timeAgo } from "@/lib/format";

const ACTION_META: Record<string, { icon: typeof Upload; className: string }> = {
  UPLOADED: { icon: Upload, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  APPROVED: { icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  REJECTED: { icon: XCircle, className: "bg-red-500/10 text-red-600 dark:text-red-400" },
  SUBMITTED: { icon: Upload, className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
  COMMENTED: { icon: MessageSquare, className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  DOWNLOADED: { icon: History, className: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400" },
  DELETED: { icon: Trash2, className: "bg-red-500/10 text-red-600 dark:text-red-400" },
  MOVED: { icon: FolderInput, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  RESTORED: { icon: History, className: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400" },
  VERSION_ADDED: { icon: History, className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
};

export function RecentActivities({ projectId, limit = 6 }: { projectId?: string; limit?: number }) {
  const { data, isLoading } = useActivities(projectId, limit);

  if (isLoading || !data) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {data.data.map((a) => {
        const meta = ACTION_META[a.action] ?? ACTION_META.UPLOADED;
        const Icon = meta.icon;
        return (
          <div key={a.id} className="flex items-start gap-3 py-2">
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${meta.className}`}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm leading-snug">{a.message}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</p>
            </div>
          </div>
        );
      })}
      {data.data.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">No recent activity yet.</p>
      )}
    </div>
  );
}
