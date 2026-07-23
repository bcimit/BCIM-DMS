"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RfiFiltersBar } from "@/components/rfi/rfi-filters-bar";
import { RfiTable } from "@/components/rfi/rfi-table";
import { RfiDetailPanel } from "@/components/rfi/rfi-detail-panel";
import { CreateRfiDialog } from "@/components/rfi/create-rfi-dialog";
import { PaginationBar } from "@/components/documents/pagination-bar";
import { useRfis } from "@/hooks/use-rfis";
import type { RfiListItem } from "@/types/rfi";

export function RfiBoard({ projectId }: { projectId: string }) {
  const [status, setStatus] = React.useState<string | undefined>();
  const [priority, setPriority] = React.useState<string | undefined>();
  const [discipline, setDiscipline] = React.useState<string | undefined>();
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedRfi, setSelectedRfi] = React.useState<RfiListItem | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const rfisQuery = useRfis({
    projectId,
    status,
    priority,
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
            <h2 className="text-lg font-semibold">Requests for Information</h2>
            <p className="text-sm text-muted-foreground">Track and respond to project RFIs</p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-950/20"
          >
            <Plus className="size-4" />
            Raise RFI
          </Button>
        </div>

        <RfiFiltersBar
          status={status}
          priority={priority}
          discipline={discipline}
          search={search}
          onStatusChange={resetFilter(setStatus)}
          onPriorityChange={resetFilter(setPriority)}
          onDisciplineChange={resetFilter(setDiscipline)}
          onSearchChange={setSearch}
        />

        <RfiTable
          rfis={rfisQuery.data?.data ?? []}
          isLoading={rfisQuery.isLoading}
          onRowClick={setSelectedRfi}
        />

        {rfisQuery.data && rfisQuery.data.total > 0 && (
          <PaginationBar
            page={page}
            totalPages={rfisQuery.data.totalPages}
            total={rfisQuery.data.total}
            pageSize={rfisQuery.data.pageSize}
            onPageChange={setPage}
          />
        )}
      </div>

      <RfiDetailPanel rfiId={selectedRfi?.id ?? null} onClose={() => setSelectedRfi(null)} />

      <CreateRfiDialog open={createOpen} onOpenChange={setCreateOpen} projectId={projectId} />
    </div>
  );
}
