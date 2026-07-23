"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmittalFiltersBar } from "@/components/submittals/submittal-filters-bar";
import { SubmittalTable } from "@/components/submittals/submittal-table";
import { SubmittalDetailPanel } from "@/components/submittals/submittal-detail-panel";
import { CreateSubmittalDialog } from "@/components/submittals/create-submittal-dialog";
import { PaginationBar } from "@/components/documents/pagination-bar";
import { useSubmittals } from "@/hooks/use-submittals";
import type { SubmittalListItem } from "@/types/submittal";

export function SubmittalBoard({ projectId }: { projectId: string }) {
  const [status, setStatus] = React.useState<string | undefined>();
  const [submittalType, setSubmittalType] = React.useState<string | undefined>();
  const [discipline, setDiscipline] = React.useState<string | undefined>();
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<SubmittalListItem | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const submittalsQuery = useSubmittals({
    projectId,
    status,
    submittalType,
    discipline,
    search: debouncedSearch,
    page,
  });

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
          <div>
            <h2 className="text-lg font-semibold">Submittals</h2>
            <p className="text-sm text-muted-foreground">Track submittal packages and approvals</p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-950/20"
          >
            <Plus className="size-4" />
            New Submittal
          </Button>
        </div>

        <SubmittalFiltersBar
          status={status}
          submittalType={submittalType}
          discipline={discipline}
          search={search}
          onStatusChange={resetFilter(setStatus)}
          onSubmittalTypeChange={resetFilter(setSubmittalType)}
          onDisciplineChange={resetFilter(setDiscipline)}
          onSearchChange={setSearch}
        />

        <SubmittalTable
          submittals={submittalsQuery.data?.data ?? []}
          isLoading={submittalsQuery.isLoading}
          onRowClick={setSelected}
        />

        {submittalsQuery.data && submittalsQuery.data.total > 0 && (
          <PaginationBar
            page={page}
            totalPages={submittalsQuery.data.totalPages}
            total={submittalsQuery.data.total}
            pageSize={submittalsQuery.data.pageSize}
            onPageChange={setPage}
          />
        )}
      </div>

      <SubmittalDetailPanel submittalId={selected?.id ?? null} onClose={() => setSelected(null)} />

      <CreateSubmittalDialog open={createOpen} onOpenChange={setCreateOpen} projectId={projectId} />
    </div>
  );
}
