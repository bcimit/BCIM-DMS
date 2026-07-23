import { Button } from "@/components/ui/button";

export function StorageUsage({
  usedGb = 136.5,
  totalGb = 200,
}: {
  usedGb?: number;
  totalGb?: number;
}) {
  const pct = Math.round((usedGb / totalGb) * 100);
  const circumference = 2 * Math.PI * 42;
  const dash = (pct / 100) * circumference;

  return (
    <div className="rounded-xl bg-sidebar-accent/40 border border-sidebar-border p-4">
      <p className="text-xs font-medium text-sidebar-foreground/70 mb-3">Storage Usage</p>
      <div className="relative mx-auto size-28">
        <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-sidebar-border"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#storage-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
          <defs>
            <linearGradient id="storage-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.72 0.18 70)" />
              <stop offset="100%" stopColor="oklch(0.64 0.18 262)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-sidebar-foreground">{pct}%</span>
          <span className="text-[10px] text-sidebar-foreground/60">Used</span>
        </div>
      </div>
      <p className="text-center text-xs text-sidebar-foreground/60 mt-3">
        {usedGb} GB / {totalGb} GB
      </p>
      <Button
        size="sm"
        className="w-full mt-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white border-0 shadow-md"
      >
        Upgrade Storage
      </Button>
    </div>
  );
}
