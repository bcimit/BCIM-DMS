import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  SUBMITTED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  UNDER_REVIEW: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  APPROVED_AS_NOTED: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  REVISE_RESUBMIT: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400",
  OVERDUE: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const TYPE_STYLES: Record<string, string> = {
  SHOP_DRAWING: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  PRODUCT_DATA: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  SAMPLE: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  CERTIFICATE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  TEST_REPORT: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  WARRANTY: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  OTHER: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

function badgeClass(styles: Record<string, string>, key: string) {
  return cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap capitalize",
    styles[key] ?? "bg-muted text-muted-foreground"
  );
}

function labelize(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}

export function SubmittalStatusBadge({ status, overdue }: { status: string; overdue?: boolean }) {
  const isPending = ["DRAFT", "SUBMITTED", "UNDER_REVIEW"].includes(status);
  if (overdue && isPending) {
    return <span className={badgeClass(STATUS_STYLES, "OVERDUE")}>Overdue</span>;
  }
  return <span className={badgeClass(STATUS_STYLES, status)}>{labelize(status)}</span>;
}

export function SubmittalTypeBadge({ submittalType }: { submittalType: string }) {
  return <span className={badgeClass(TYPE_STYLES, submittalType)}>{labelize(submittalType)}</span>;
}
