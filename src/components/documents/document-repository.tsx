"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
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
import { MoveDocumentDialog } from "@/components/documents/move-document-dialog";
import { useFolders } from "@/hooks/use-folders";
import { useDocuments } from "@/hooks/use-documents";
import type { DocumentListItem } from "@/types/document";

export function DocumentRepository({
  projectId,
  title = "Document Repository",
  lockedType,
  lockedDiscipline,
}: {
  projectId: string;
  title?: string;
  lockedType?: string;
  lockedDiscipline?: string;
}) {
  const searchParams = useSearchParams();
  const [folderId, setFolderId] = React.useState<string | null>(null);
  const [view, setView] = React.useState<ViewMode>("list");
  const [type, setType] = React.useState<string | undefined>();
  const [status, setStatus] = React.useState<string | undefined>();
  const [discipline, setDiscipline] = React.useState<string | undefined>();
  const [search, setSearch] = React.useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = React.useState(searchParams.get("search") ?? "");
  const [page, setPage] = React.useState(1);
  const [selectedDoc, setSelectedDoc] = React.useState<DocumentListItem | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [createFolderOpen, setCreateFolderOpen] = React.useState(false);
  const [bulkDialog, setBulkDialog] = React.useState<"move" | "copy" | null>(null);
  const queryClient = useQueryClient();

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
    type: lockedType ?? type,
    status,
    discipline: lockedDiscipline ?? discipline,
    search: debouncedSearch,
    page,
  });

  function handleNavigate(id: string | null) {
    setFolderId(id);
    setPage(1);
    setSelectedIds([]);
  }

  function resetFilter<T>(setter: (v: T | undefined) => void) {
    return (v: T | undefined) => {
      setter(v);
      setPage(1);
      setSelectedIds([]);
    };
  }

  function invalidateAfterBulkAction() {
    setSelectedIds([]);
    queryClient.invalidateQueries({ queryKey: ["documents"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    queryClient.invalidateQueries({ queryKey: ["activities"] });
    queryClient.invalidateQueries({ queryKey: ["folders"] });
  }

  async function handleExport() {
    const params = new URLSearchParams({ projectId });
    if (folderId) params.set("folderId", folderId);
    const effectiveType = lockedType ?? type;
    if (effectiveType) params.set("type", effectiveType);
    if (status) params.set("status", status);
    const effectiveDiscipline = lockedDiscipline ?? discipline;
    if (effectiveDiscipline) params.set("discipline", effectiveDiscipline);
    if (debouncedSearch) params.set("search", debouncedSearch);

    const res = await fetch(`/api/documents/export?${params.toString()}`);
    if (!res.ok) {
      toast.error("Export failed");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `documents-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  }

  async function handleBulkDownload() {
    if (selectedIds.length === 0) {
      toast.error("Select at least one document first");
      return;
    }
    for (const id of selectedIds) {
      window.open(`/api/documents/${id}/content`, "_blank");
    }
  }

  async function handleBulkArchive() {
    if (selectedIds.length === 0) {
      toast.error("Select at least one document first");
      return;
    }
    await Promise.all(
      selectedIds.map((id) =>
        fetch(`/api/documents/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ARCHIVED" }),
        })
      )
    );
    toast.success(`${selectedIds.length} document(s) archived`);
    invalidateAfterBulkAction();
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) {
      toast.error("Select at least one document first");
      return;
    }
    await Promise.all(selectedIds.map((id) => fetch(`/api/documents/${id}/delete`, { method: "POST" })));
    toast.success(`${selectedIds.length} document(s) moved to Recycle Bin`);
    invalidateAfterBulkAction();
  }

  function requireSelection(action: () => void) {
    if (selectedIds.length === 0) {
      toast.error("Select at least one document first");
      return;
    }
    action();
  }

  return (
    <div className="flex gap-4 items-start">
      <div className="glass-panel rounded-2xl p-4 lg:p-5 flex-1 min-w-0 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h2 className="text-lg font-semibold">{title}</h2>
            <BreadcrumbNav
              projectName={foldersQuery.data?.project?.name ?? "Project"}
              crumbs={foldersQuery.data?.breadcrumb ?? []}
              onNavigate={handleNavigate}
            />
          </div>
          <DocumentToolbar
            onUpload={() => setUploadOpen(true)}
            onCreateFolder={() => setCreateFolderOpen(true)}
            onExport={handleExport}
            onBulkDownload={() => requireSelection(handleBulkDownload)}
            onMove={() => requireSelection(() => setBulkDialog("move"))}
            onCopy={() => requireSelection(() => setBulkDialog("copy"))}
            onArchive={() => requireSelection(handleBulkArchive)}
            onDelete={() => requireSelection(handleBulkDelete)}
            selectionCount={selectedIds.length}
          />
        </div>

        <FiltersBar
          type={type}
          status={status}
          discipline={discipline}
          search={search}
          view={view}
          hideType={!!lockedType}
          hideDiscipline={!!lockedDiscipline}
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
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
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
        forcedType={lockedType?.split(",")[0]}
        forcedDiscipline={lockedDiscipline}
      />
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        projectId={projectId}
        parentId={folderId}
      />
      <MoveDocumentDialog
        open={bulkDialog !== null}
        onOpenChange={(v) => setBulkDialog(v ? bulkDialog : null)}
        projectId={projectId}
        documentIds={selectedIds}
        mode={bulkDialog ?? "move"}
        onDone={() => setSelectedIds([])}
      />
    </div>
  );
}
