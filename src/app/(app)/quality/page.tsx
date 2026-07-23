import { FilteredDocumentPage } from "@/components/documents/filtered-document-page";

export const dynamic = "force-dynamic";

export default async function QualityPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  return (
    <FilteredDocumentPage
      title="Quality Documents"
      subtitle="QA/QC checklists and inspection records"
      projectIdParam={project}
      lockedDiscipline="QAQC"
    />
  );
}
