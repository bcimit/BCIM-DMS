import { PageHeader } from "@/components/layout/page-header";
import { RfiKpiRow } from "@/components/rfi/rfi-kpi-row";
import { RfiBoard } from "@/components/rfi/rfi-board";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RfiPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project: projectIdParam } = await searchParams;

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
      <PageHeader title="RFIs" subtitle="Requests for information across all projects" />

      <RfiKpiRow projectId={project.id} />

      <RfiBoard key={project.id} projectId={project.id} />
    </div>
  );
}
