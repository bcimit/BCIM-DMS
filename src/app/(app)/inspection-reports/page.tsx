import { FilteredDocumentPage } from "@/components/documents/filtered-document-page";

export const dynamic = "force-dynamic";

export default async function InspectionReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  return (
    <FilteredDocumentPage
      title="Inspection Reports"
      subtitle="Site inspection reports and findings"
      projectIdParam={project}
      lockedType="REPORT"
    />
  );
}
