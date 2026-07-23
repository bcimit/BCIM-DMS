"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { RecycleBinTable } from "@/components/recycle-bin/recycle-bin-table";
import { PaginationBar } from "@/components/documents/pagination-bar";
import { useRecycleBin } from "@/hooks/use-recycle-bin";
import { isAdminRole } from "@/lib/permissions";

export function RecycleBinBoard({ projectId }: { projectId: string }) {
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = useRecycleBin(projectId, page);
  const { data: session } = useSession();

  return (
    <div className="glass-panel rounded-2xl p-4 lg:p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Recycle Bin</h2>
        <p className="text-sm text-muted-foreground">
          Deleted documents stay here until restored or permanently deleted.
        </p>
      </div>

      <RecycleBinTable
        documents={data?.data ?? []}
        isLoading={isLoading}
        isAdmin={isAdminRole(session?.user?.role)}
      />

      {data && data.total > 0 && (
        <PaginationBar
          page={page}
          totalPages={data.totalPages}
          total={data.total}
          pageSize={data.pageSize}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
