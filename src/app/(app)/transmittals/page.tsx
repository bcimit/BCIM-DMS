import { FilteredDocumentPage } from "@/components/documents/filtered-document-page";

export const dynamic = "force-dynamic";

export default async function TransmittalsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  return (
    <FilteredDocumentPage
      title="Transmittals"
      subtitle="Document transmittal logs"
      projectIdParam={project}
      lockedType="TRANSMITTAL"
    />
  );
}
