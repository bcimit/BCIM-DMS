import { Construction } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

export function ComingSoon({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-24 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 mb-4">
          <Construction className="size-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">{title} module coming soon</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          This section is on the roadmap. Document Management is fully wired up — head there to see it live.
        </p>
      </div>
    </>
  );
}
