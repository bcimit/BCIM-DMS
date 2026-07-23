import { PageHeader } from "@/components/layout/page-header";
import { NoProjectFound } from "@/components/layout/no-project-found";
import { ApprovalsBoard } from "@/components/approvals/approvals-board";
import { getSelectedProject } from "@/lib/get-selected-project";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project: projectIdParam } = await searchParams;
  const project = await getSelectedProject(projectIdParam);

  return (
    <div className="space-y-4">
      <PageHeader title="Approvals" subtitle="Pending and completed approval workflows" />
      {project ? <ApprovalsBoard key={project.id} projectId={project.id} /> : <NoProjectFound />}
    </div>
  );
}
