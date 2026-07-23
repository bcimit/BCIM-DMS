"use client";

import * as React from "react";
import { BreadcrumbNav } from "@/components/documents/breadcrumb-nav";
import { DocumentToolbar } from "@/components/documents/toolbar";
import { FiltersBar, type ViewMode } from "@/components/documents/filters-bar";
import { FolderChips } from "@/components/documents/folder-chips";
import { DocumentTable } from "@/components/documents/document-table";
import { DocumentGrid } from "@/components/documents/document-grid";
import { PaginationBar } from "@/components/documents/pagination-bar";
import { DocumentDetailPanel } from "@/components/documents/document-detail-panel";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { CreateFolderDialog } from "@/components/documents/create-folder-dialog";
import { useFolders } from "@/hooks/use-folders";
import { useDocuments } from "@/hooks/use-documents";
import type { DocumentListItem } from "@/types/document";

export function DocumentRepository({ projectId }: { projectId: string }) {
  const [folderId, setFolderId] = React.useState<string | null>(null);
  const [view, setView] = React.useState<ViewMode>("list");
  const [type, setType] = React.useState<string | undefined>();
  const [status, setStatus] = React.useState<string | undefined>();
  const [discipline, setDiscipline] = React.useState<string | undefined>();
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedDoc, setSelectedDoc] = React.useState<DocumentListItem | null>(null);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [createFolderOpen, setCreateFolderOpen] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const foldersQuery = useFolders(projectId, folderId);
  const documentsQuery = useDocuments({
    projectId,
    folderId,
    type,
    status,
    discipline,
    search: debouncedSearch,
    page,
  });

  function handleNavigate(id: string | null) {
    setFolderId(id);
    setPage(1);
  }

  function resetFilter<T>(setter: (v: T | undefined) => void) {
    return (v: T | undefined) => {
      setter(v);
      setPage(1);
    };
  }

  return (
    <div className="flex gap-4 items-start">
      <div className="glass-panel rounded-2xl p-4 lg:p-5 flex-1 min-w-0 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h2 className="text-lg font-semibold">Document Repository</h2>
            <BreadcrumbNav
              projectName={foldersQuery.data?.project?.name ?? "Project"}
              crumbs={foldersQuery.data?.breadcrumb ?? []}
              onNavigate={handleNavigate}
            />
          </div>
          <DocumentToolbar onUpload={() => setUploadOpen(true)} onCreateFolder={() => setCreateFolderOpen(true)} />
        </div>

        <FiltersBar
          type={type}
          status={status}
          discipline={discipline}
          search={search}
          view={view}
          onTypeChange={resetFilter(setType)}
          onStatusChange={resetFilter(setStatus)}
          onDisciplineChange={resetFilter(setDiscipline)}
          onSearchChange={setSearch}
          onViewChange={setView}
        />

        {foldersQuery.data && <FolderChips folders={foldersQuery.data.children} onOpen={handleNavigate} />}

        {view === "list" ? (
          <DocumentTable
            documents={documentsQuery.data?.data ?? []}
            isLoading={documentsQuery.isLoading}
            onRowClick={setSelectedDoc}
          />
        ) : (
          <DocumentGrid
            documents={documentsQuery.data?.data ?? []}
            isLoading={documentsQuery.isLoading}
            onCardClick={setSelectedDoc}
          />
        )}

        {documentsQuery.data && documentsQuery.data.total > 0 && (
          <PaginationBar
            page={page}
            totalPages={documentsQuery.data.totalPages}
            total={documentsQuery.data.total}
            pageSize={documentsQuery.data.pageSize}
            onPageChange={setPage}
          />
        )}
      </div>

      <DocumentDetailPanel documentId={selectedDoc?.id ?? null} onClose={() => setSelectedDoc(null)} />

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        projectId={projectId}
        folderId={folderId}
      />
      <CreateFolderDialog open={createFolderOpen} onOpenChange={setCreateFolderOpen} />
    </div>
  );
}
