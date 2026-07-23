import { PageHeader } from "@/components/layout/page-header";
import { NoProjectFound } from "@/components/layout/no-project-found";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";
import { getSelectedProject } from "@/lib/get-selected-project";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project: projectIdParam } = await searchParams;
  const project = await getSelectedProject(projectIdParam);

  return (
    <div className="space-y-4">
      <PageHeader title="Reports" subtitle="Analytics and usage reports" />
      {project ? <ReportsDashboard key={project.id} projectId={project.id} /> : <NoProjectFound />}
    </div>
  );
}
