"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FolderKanban } from "lucide-react";

export function BreadcrumbNav({
  projectName,
  crumbs,
  onNavigate,
}: {
  projectName: string;
  crumbs: { id: string; name: string }[];
  onNavigate: (folderId: string | null) => void;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap overflow-x-auto">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <button onClick={() => onNavigate(null)} className="flex items-center gap-1.5 hover:text-foreground">
              <FolderKanban className="size-3.5" />
              Projects
            </button>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <button onClick={() => onNavigate(null)} className="hover:text-foreground whitespace-nowrap">
              {projectName}
            </button>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <div key={c.id} className="flex items-center gap-1.5 sm:gap-2.5">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="whitespace-nowrap">{c.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button onClick={() => onNavigate(c.id)} className="hover:text-foreground whitespace-nowrap">
                      {c.name}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
