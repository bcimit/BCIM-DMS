"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, MessageCircleQuestion, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { RfiPriorityBadge, RfiStatusBadge } from "@/components/rfi/rfi-badges";
import { useRfi } from "@/hooks/use-rfi";
import { formatDate, formatDateTime } from "@/lib/format";
import type { RfiDetail } from "@/types/rfi";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right truncate">{value}</span>
    </div>
  );
}

function RfiDetailContent({ rfi }: { rfi: RfiDetail }) {
  const queryClient = useQueryClient();
  const [responseText, setResponseText] = React.useState(rfi.response ?? "");

  const updateMutation = useMutation({
    mutationFn: async (body: { response?: string; status?: string }) => {
      const res = await fetch(`/api/rfis/${rfi.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update RFI");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfis"] });
      queryClient.invalidateQueries({ queryKey: ["rfi-stats"] });
      queryClient.invalidateQueries({ queryKey: ["rfi", rfi.id] });
    },
    onError: () => toast.error("Something went wrong"),
  });

  function handleRespond() {
    if (!responseText.trim()) {
      toast.error("Enter a response before submitting");
      return;
    }
    updateMutation.mutate(
      { response: responseText, status: "ANSWERED" },
      { onSuccess: () => toast.success("Response submitted") }
    );
  }

  function handleClose() {
    updateMutation.mutate({ status: "CLOSED" }, { onSuccess: () => toast.success("RFI closed") });
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <MessageCircleQuestion className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm leading-tight">{rfi.subject}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{rfi.rfiNo}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RfiStatusBadge status={rfi.status} overdue={new Date(rfi.dueDate) < new Date() && rfi.status !== "CLOSED"} />
          <RfiPriorityBadge priority={rfi.priority} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Details</p>
          <div className="divide-y divide-border/60">
            <DetailRow label="Discipline" value={rfi.discipline.replaceAll("_", " ")} />
            <DetailRow label="Raised By" value={rfi.raisedBy.name} />
            <DetailRow label="Assigned To" value={rfi.assignedTo?.name ?? "Unassigned"} />
            <DetailRow label="Due Date" value={formatDate(rfi.dueDate)} />
            <DetailRow label="Raised On" value={formatDateTime(rfi.createdAt)} />
            {rfi.answeredAt && <DetailRow label="Answered On" value={formatDateTime(rfi.answeredAt)} />}
            {rfi.closedAt && <DetailRow label="Closed On" value={formatDateTime(rfi.closedAt)} />}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Question</p>
          <p className="text-sm leading-relaxed rounded-xl bg-muted/40 p-3">{rfi.question}</p>
        </div>

        {rfi.status !== "CLOSED" ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {rfi.response ? "Response" : "Respond"}
            </p>
            <Textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Write a response…"
              rows={4}
              className="resize-none"
            />
            <Button size="sm" className="w-full mt-2" disabled={updateMutation.isPending} onClick={handleRespond}>
              <Send className="size-3.5" />
              Submit Response
            </Button>
          </div>
        ) : (
          rfi.response && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Response</p>
              <p className="text-sm leading-relaxed rounded-xl bg-muted/40 p-3">{rfi.response}</p>
            </div>
          )
        )}
      </div>

      {rfi.status !== "CLOSED" && (
        <div className="p-4 border-t border-border/60">
          <Button className="w-full" variant="outline" disabled={updateMutation.isPending} onClick={handleClose}>
            <CheckCircle2 className="size-4" /> Close RFI
          </Button>
        </div>
      )}
    </>
  );
}

export function RfiDetailPanel({ rfiId, onClose }: { rfiId: string | null; onClose: () => void }) {
  const { data, isLoading } = useRfi(rfiId);
  const rfi = data?.data;

  return (
    <AnimatePresence>
      {rfiId && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="shrink-0 overflow-hidden"
        >
          <div className="glass-panel-lg rounded-2xl w-[380px] h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60">
              <h3 className="text-sm font-semibold">RFI Details</h3>
              <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close panel">
                <X className="size-4" />
              </Button>
            </div>

            {isLoading || !rfi ? (
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <RfiDetailContent key={rfi.id} rfi={rfi} />
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
