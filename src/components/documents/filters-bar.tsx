"use client";

import { LayoutGrid, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DISCIPLINES, DOCUMENT_STATUSES, DOCUMENT_TYPES } from "@/lib/constants";

export type ViewMode = "list" | "grid";

const TYPES = DOCUMENT_TYPES;
const STATUSES = DOCUMENT_STATUSES;

function FilterSelect({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <Select value={value ?? "all"} onValueChange={(v) => onChange(v === "all" ? undefined : v)}>
      <SelectTrigger className="w-full sm:w-[150px] bg-muted/40 border-transparent">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FiltersBar({
  type,
  status,
  discipline,
  search,
  view,
  onTypeChange,
  onStatusChange,
  onDisciplineChange,
  onSearchChange,
  onViewChange,
  hideType,
  hideDiscipline,
}: {
  type?: string;
  status?: string;
  discipline?: string;
  search: string;
  view: ViewMode;
  onTypeChange: (v?: string) => void;
  onStatusChange: (v?: string) => void;
  onDisciplineChange: (v?: string) => void;
  onSearchChange: (v: string) => void;
  onViewChange: (v: ViewMode) => void;
  hideType?: boolean;
  hideDiscipline?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex flex-wrap gap-2 flex-1">
        {!hideType && <FilterSelect placeholder="All Types" options={TYPES} value={type} onChange={onTypeChange} />}
        <FilterSelect placeholder="All Status" options={STATUSES} value={status} onChange={onStatusChange} />
        {!hideDiscipline && (
          <FilterSelect placeholder="All Disciplines" options={DISCIPLINES} value={discipline} onChange={onDisciplineChange} />
        )}
      </div>

      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search in folder"
          className="pl-9 bg-muted/40 border-transparent"
        />
      </div>

      <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 shrink-0">
        <Button
          size="icon-sm"
          variant="ghost"
          className={cn("rounded-md", view === "list" && "bg-background shadow-sm")}
          onClick={() => onViewChange("list")}
          aria-label="List view"
        >
          <List className="size-4" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          className={cn("rounded-md", view === "grid" && "bg-background shadow-sm")}
          onClick={() => onViewChange("grid")}
          aria-label="Grid view"
        >
          <LayoutGrid className="size-4" />
        </Button>
      </div>
    </div>
  );
}
