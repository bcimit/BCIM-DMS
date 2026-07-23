import { FilteredDocumentPage } from "@/components/documents/filtered-document-page";

export const dynamic = "force-dynamic";

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  return (
    <FilteredDocumentPage
      title="Contracts"
      subtitle="Contract documents and amendments"
      projectIdParam={project}
      lockedType="CONTRACT"
    />
  );
}
