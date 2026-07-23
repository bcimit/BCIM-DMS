import { FilteredDocumentPage } from "@/components/documents/filtered-document-page";

export const dynamic = "force-dynamic";

export default async function BoqPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  return (
    <FilteredDocumentPage
      title="Bill of Quantities"
      subtitle="BOQ line items and cost breakdowns"
      projectIdParam={project}
      lockedType="BOQ"
    />
  );
}
