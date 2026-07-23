import { FilteredDocumentPage } from "@/components/documents/filtered-document-page";

export const dynamic = "force-dynamic";

export default async function MaterialApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  return (
    <FilteredDocumentPage
      title="Material Approvals"
      subtitle="Material submittal and approval tracking"
      projectIdParam={project}
      lockedType="SUBMITTAL"
    />
  );
}
