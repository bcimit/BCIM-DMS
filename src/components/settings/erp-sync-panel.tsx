"use client";

import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { formatDateTime } from "@/lib/format";

type SyncStatus = {
  enabled: boolean;
  endpoints: Record<string, { lastSyncedAt: string | null }>;
};

const LABELS: Record<string, string> = {
  "work-orders": "Work Orders",
  "purchase-orders": "Purchase Orders",
  mrs: "Material Requisitions",
};

export function ErpSyncPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["erp-sync-status"],
    queryFn: () => fetcher<{ data: SyncStatus }>("/api/sync/erp"),
    refetchInterval: 30_000,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/sync/erp", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      return res.json() as Promise<{
        data: { workOrders: number; purchaseOrders: number; mrs: number; projectsCreated: string[]; errors: string[] };
      }>;
    },
    onSuccess: (result) => {
      const { workOrders, purchaseOrders, mrs, errors } = result.data;
      const total = workOrders + purchaseOrders + mrs;
      if (total > 0) {
        toast.success(`Synced ${total} new document(s) from ERP`);
      } else if (errors.length === 0) {
        toast.success("Sync ran — nothing new");
      }
      if (errors.length > 0) {
        errors.forEach((e) => toast.error(`ERP sync error: ${e}`));
      }
      queryClient.invalidateQueries({ queryKey: ["erp-sync-status"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => toast.error("Sync failed to run"),
  });

  if (isLoading || !data) {
    return <Skeleton className="h-32 w-full" />;
  }

  const { enabled, endpoints } = data.data;

  return (
    <div className="space-y-3">
      {!enabled ? (
        <p className="text-sm text-muted-foreground">ERP integration is not configured (ERP_API_KEY missing).</p>
      ) : (
        <div className="divide-y divide-border/60 rounded-lg border border-border">
          {Object.entries(endpoints).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between px-3 py-2.5 text-sm">
              <span className="font-medium">{LABELS[key] ?? key}</span>
              {value.lastSyncedAt ? (
                <span className="text-muted-foreground">Last synced {formatDateTime(value.lastSyncedAt)}</span>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Never synced
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !enabled} variant="outline" size="sm">
        <RefreshCw className={mutation.isPending ? "size-4 animate-spin" : "size-4"} />
        Sync Now
      </Button>
    </div>
  );
}
