import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ANSWERED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  CLOSED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  OVERDUE: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  MEDIUM: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  HIGH: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  CRITICAL: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function badgeClass(styles: Record<string, string>, key: string) {
  return cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap capitalize",
    styles[key] ?? "bg-muted text-muted-foreground"
  );
}

export function RfiStatusBadge({ status, overdue }: { status: string; overdue?: boolean }) {
  if (overdue && status !== "CLOSED") {
    return <span className={badgeClass(STATUS_STYLES, "OVERDUE")}>Overdue</span>;
  }
  return <span className={badgeClass(STATUS_STYLES, status)}>{status.toLowerCase()}</span>;
}

export function RfiPriorityBadge({ priority }: { priority: string }) {
  return <span className={badgeClass(PRIORITY_STYLES, priority)}>{priority.toLowerCase()}</span>;
}
