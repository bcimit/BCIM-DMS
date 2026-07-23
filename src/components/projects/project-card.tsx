import Link from "next/link";
import { Building2, FileStack, Folder, MapPin } from "lucide-react";
import { timeAgo } from "@/lib/format";
import type { ProjectSummary } from "@/types/document";

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const approvedPct = project.documentCount
    ? Math.round((project.approvedCount / project.documentCount) * 100)
    : 0;

  return (
    <Link
      href={`/documents?project=${project.id}`}
      className="glass-panel hover-lift rounded-2xl p-5 flex flex-col gap-4 min-w-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-950/20 shrink-0">
          <Building2 className="size-5" />
        </div>
        {project.pendingCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap">
            {project.pendingCount} pending
          </span>
        )}
      </div>

      <div className="min-w-0">
        <h3 className="font-semibold truncate">{project.name}</h3>
        <p className="text-xs text-muted-foreground">{project.code}</p>
        {project.location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="size-3" />
            {project.location}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <FileStack className="size-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium">{project.documentCount}</span>
          <span className="text-xs text-muted-foreground">docs</span>
        </div>
        <div className="flex items-center gap-2">
          <Folder className="size-4 text-amber-600 dark:text-amber-400" />
          <span className="font-medium">{project.folderCount}</span>
          <span className="text-xs text-muted-foreground">folders</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Approved</span>
          <span className="font-medium">{approvedPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            style={{ width: `${approvedPct}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Last activity {timeAgo(project.lastActivityAt)}</p>
    </Link>
  );
}
