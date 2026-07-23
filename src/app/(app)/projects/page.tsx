import { FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectsToolbar } from "@/components/projects/projects-toolbar";
import { getProjectSummaries } from "@/lib/get-project-summaries";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const cards = await getProjectSummaries();

  return (
    <div className="space-y-4">
      <PageHeader title="Projects" subtitle="Manage all active and completed projects" />
      <div className="flex justify-end">
        <ProjectsToolbar />
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-24 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 mb-4">
            <FolderKanban className="size-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">No projects yet</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Click &quot;New Project&quot; above to create your first one.
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
  );
}
