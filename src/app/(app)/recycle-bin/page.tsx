import { PageHeader } from "@/components/layout/page-header";
import { NoProjectFound } from "@/components/layout/no-project-found";
import { RecycleBinBoard } from "@/components/recycle-bin/recycle-bin-board";
import { getSelectedProject } from "@/lib/get-selected-project";

export const dynamic = "force-dynamic";

export default async function RecycleBinPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project: projectIdParam } = await searchParams;
  const project = await getSelectedProject(projectIdParam);

  return (
    <div className="space-y-4">
      <PageHeader title="Recycle Bin" subtitle="Restore or permanently delete removed documents" />
      {project ? <RecycleBinBoard key={project.id} projectId={project.id} /> : <NoProjectFound />}
    </div>
  );
}
