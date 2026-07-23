import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiRow } from "@/components/documents/kpi-row";
import { StatusDonut } from "@/components/documents/status-donut";
import { DocumentTrendChart } from "@/components/documents/document-trend-chart";
import { RecentActivities } from "@/components/documents/recent-activities";
import { ProjectCard } from "@/components/projects/project-card";
import { getProjectSummaries } from "@/lib/get-project-summaries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cards = await getProjectSummaries();

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" subtitle="Overview of all your construction projects" />

      <KpiRow />

      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Your Projects</h2>
            <p className="text-sm text-muted-foreground">{cards.length} active projects across BCIM</p>
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 mb-4">
              <FolderKanban className="size-7 text-primary" />
            </div>
            <h3 className="text-base font-semibold">No projects yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Run `npm run db:seed` to populate demo projects.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {cards.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Document Status Overview</h3>
          <StatusDonut />
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Document Trend (This Month)</h3>
          <DocumentTrendChart />
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Recent Activities</h3>
          <RecentActivities limit={6} />
        </div>
      </div>
    </div>
  );
}
