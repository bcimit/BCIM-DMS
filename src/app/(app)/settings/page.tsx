import { ShieldAlert } from "lucide-react";
import { auth } from "@/auth";
import { ComingSoon } from "@/components/layout/coming-soon";
import { PageHeader } from "@/components/layout/page-header";
import { isAdminRole } from "@/lib/permissions";

export default async function SettingsPage() {
  const session = await auth();

  if (!isAdminRole(session?.user?.role)) {
    return (
      <>
        <PageHeader title="Settings" subtitle="Configure your workspace preferences" />
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-24 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 mb-4">
            <ShieldAlert className="size-7 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold">Access restricted</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Settings is limited to Document Controllers, Project Managers, Project Directors, and Super Admins.
            Your role ({session?.user?.role?.replaceAll("_", " ") ?? "unknown"}) doesn&apos;t have access.
          </p>
        </div>
      </>
    );
  }

  return <ComingSoon title="Settings" subtitle="Configure your workspace preferences" />;
}
