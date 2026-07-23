import { PageHeader } from "@/components/layout/page-header";
import { KpiRow } from "@/components/documents/kpi-row";
import { DocumentRepository } from "@/components/documents/document-repository";
import { StatusDonut } from "@/components/documents/status-donut";
import { DocumentTrendChart } from "@/components/documents/document-trend-chart";
import { RecentActivities } from "@/components/documents/recent-activities";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; search?: string }>;
}) {
  const { project: projectIdParam, search } = await searchParams;

  const project = projectIdParam
    ? await prisma.project.findUnique({ where: { id: projectIdParam }, select: { id: true } })
    : await prisma.project.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });

  if (!project) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No project found. Run `npm run db:seed` to populate demo data.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Document Management System" subtitle="Centralized repository for all project documents" />

      <KpiRow projectId={project.id} />

      <DocumentRepository key={`${project.id}-${search ?? ""}`} projectId={project.id} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Document Status Overview</h3>
          <StatusDonut projectId={project.id} />
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Document Trend (This Month)</h3>
          <DocumentTrendChart projectId={project.id} />
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Recent Activities</h3>
          <RecentActivities projectId={project.id} />
        </div>
      </div>
    </div>
  );
}
