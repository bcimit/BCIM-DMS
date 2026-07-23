import { PageHeader } from "@/components/layout/page-header";
import { NoProjectFound } from "@/components/layout/no-project-found";
import { DocumentRepository } from "@/components/documents/document-repository";
import { getSelectedProject } from "@/lib/get-selected-project";

export async function FilteredDocumentPage({
  title,
  subtitle,
  projectIdParam,
  lockedType,
  lockedDiscipline,
}: {
  title: string;
  subtitle: string;
  projectIdParam?: string;
  lockedType?: string;
  lockedDiscipline?: string;
}) {
  const project = await getSelectedProject(projectIdParam);

  if (!project) {
    return (
      <div className="space-y-4">
        <PageHeader title={title} subtitle={subtitle} />
        <NoProjectFound />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title={title} subtitle={subtitle} />
      <DocumentRepository
        key={project.id}
        projectId={project.id}
        title={title}
        lockedType={lockedType}
        lockedDiscipline={lockedDiscipline}
      />
    </div>
  );
}
