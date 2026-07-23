import { FilteredDocumentPage } from "@/components/documents/filtered-document-page";

export const dynamic = "force-dynamic";

export default async function CorrespondencePage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  return (
    <FilteredDocumentPage
      title="Correspondence"
      subtitle="Project letters and official communication"
      projectIdParam={project}
      lockedType="CORRESPONDENCE"
    />
  );
}
