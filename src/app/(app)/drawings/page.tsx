import { FilteredDocumentPage } from "@/components/documents/filtered-document-page";

export const dynamic = "force-dynamic";

export default async function DrawingsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  return (
    <FilteredDocumentPage
      title="Drawings & Plans"
      subtitle="Technical drawings and construction plans"
      projectIdParam={project}
      lockedType="DRAWING,CAD_DRAWING"
    />
  );
}
