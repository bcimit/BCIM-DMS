import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  SUBMITTED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  UNDER_REVIEW: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  REVIEWED: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400",
  ARCHIVED: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
  CANCELLED: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  REVIEWED: "Reviewed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
  CANCELLED: "Cancelled",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
