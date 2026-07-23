"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, FileCheck2, CheckCircle2, RefreshCcw, XCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { SubmittalStatusBadge, SubmittalTypeBadge } from "@/components/submittals/submittal-badges";
import { useSubmittal } from "@/hooks/use-submittal";
import { formatDate, formatDateTime } from "@/lib/format";
import type { SubmittalDetail } from "@/types/submittal";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right truncate">{value}</span>
    </div>
  );
}

const PENDING_STATUSES = ["DRAFT", "SUBMITTED", "UNDER_REVIEW"];

function SubmittalDetailContent({ submittal }: { submittal: SubmittalDetail }) {
  const queryClient = useQueryClient();
  const [comments, setComments] = React.useState(submittal.reviewComments ?? "");

  const updateMutation = useMutation({
    mutationFn: async (body: { reviewComments?: string; status?: string }) => {
      const res = await fetch(`/api/submittals/${submittal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update submittal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submittals"] });
      queryClient.invalidateQueries({ queryKey: ["submittal-stats"] });
      queryClient.invalidateQueries({ queryKey: ["submittal", submittal.id] });
    },
    onError: () => toast.error("Something went wrong"),
  });

  function handleSubmitForReview() {
    updateMutation.mutate({ status: "SUBMITTED" }, { onSuccess: () => toast.success("Submitted for review") });
  }

  function handleReview(status: string, label: string) {
    updateMutation.mutate(
      { reviewComments: comments, status },
      { onSuccess: () => toast.success(`Marked as ${label}`) }
    );
  }

  const isPending = PENDING_STATUSES.includes(submittal.status);
  const canReview = submittal.status === "SUBMITTED" || submittal.status === "UNDER_REVIEW";

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <FileCheck2 className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm leading-tight">{submittal.subject}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{submittal.submittalNo}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SubmittalStatusBadge
            status={submittal.status}
            overdue={isPending && new Date(submittal.dueDate) < new Date()}
          />
          <SubmittalTypeBadge submittalType={submittal.submittalType} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Details</p>
          <div className="divide-y divide-border/60">
            <DetailRow label="Discipline" value={submittal.discipline.replaceAll("_", " ")} />
            {submittal.specSection && <DetailRow label="Spec Section" value={submittal.specSection} />}
            <DetailRow label="Revision" value={submittal.revision} />
            <DetailRow label="Submitted By" value={submittal.submittedBy.name} />
            <DetailRow label="Reviewed By" value={submittal.reviewedBy?.name ?? "Pending"} />
            <DetailRow label="Due Date" value={formatDate(submittal.dueDate)} />
            <DetailRow label="Created On" value={formatDateTime(submittal.createdAt)} />
            {submittal.reviewedAt && <DetailRow label="Reviewed On" value={formatDateTime(submittal.reviewedAt)} />}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Description</p>
          <p className="text-sm leading-relaxed rounded-xl bg-muted/40 p-3">{submittal.description}</p>
        </div>

        {canReview ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Review Comments
            </p>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add review comments…"
              rows={3}
              className="resize-none"
            />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => handleReview("APPROVED", "Approved")}
              >
                <CheckCircle2 className="size-3.5" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={updateMutation.isPending}
                onClick={() => handleReview("APPROVED_AS_NOTED", "Approved as Noted")}
              >
                <CheckCircle2 className="size-3.5" /> As Noted
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={updateMutation.isPending}
                onClick={() => handleReview("REVISE_RESUBMIT", "Revise & Resubmit")}
              >
                <RefreshCcw className="size-3.5" /> Revise
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                disabled={updateMutation.isPending}
                onClick={() => handleReview("REJECTED", "Rejected")}
              >
                <XCircle className="size-3.5" /> Reject
              </Button>
            </div>
          </div>
        ) : (
          submittal.reviewComments && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Review Comments
              </p>
              <p className="text-sm leading-relaxed rounded-xl bg-muted/40 p-3">{submittal.reviewComments}</p>
            </div>
          )
        )}
      </div>

      {submittal.status === "DRAFT" && (
        <div className="p-4 border-t border-border/60">
          <Button className="w-full" disabled={updateMutation.isPending} onClick={handleSubmitForReview}>
            <Send className="size-4" /> Submit for Review
          </Button>
        </div>
      )}
    </>
  );
}

export function SubmittalDetailPanel({
  submittalId,
  onClose,
}: {
  submittalId: string | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useSubmittal(submittalId);
  const submittal = data?.data;

  return (
    <AnimatePresence>
      {submittalId && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="shrink-0 overflow-hidden"
        >
          <div className="glass-panel-lg rounded-2xl w-[380px] h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60">
              <h3 className="text-sm font-semibold">Submittal Details</h3>
              <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close panel">
                <X className="size-4" />
              </Button>
            </div>

            {isLoading || !submittal ? (
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <SubmittalDetailContent key={submittal.id} submittal={submittal} />
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
