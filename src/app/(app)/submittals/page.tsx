import { PageHeader } from "@/components/layout/page-header";
import { SubmittalKpiRow } from "@/components/submittals/submittal-kpi-row";
import { SubmittalBoard } from "@/components/submittals/submittal-board";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SubmittalsPage({
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
        No project found. Create a project first.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Submittals" subtitle="Track submittal packages and approvals" />

      <SubmittalKpiRow projectId={project.id} />

      <SubmittalBoard key={project.id} projectId={project.id} />
    </div>
  );
}
