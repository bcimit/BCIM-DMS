import { FilteredDocumentPage } from "@/components/documents/filtered-document-page";

export const dynamic = "force-dynamic";

export default async function SafetyPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  return (
    <FilteredDocumentPage
      title="Safety Documents"
      subtitle="Safety plans, permits, and incident reports"
      projectIdParam={project}
      lockedDiscipline="SAFETY"
    />
  );
}
