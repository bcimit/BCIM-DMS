"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DISCIPLINES } from "@/lib/constants";

const STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "APPROVED_AS_NOTED", label: "Approved as Noted" },
  { value: "REVISE_RESUBMIT", label: "Revise & Resubmit" },
  { value: "REJECTED", label: "Rejected" },
];

const TYPES = [
  { value: "SHOP_DRAWING", label: "Shop Drawing" },
  { value: "PRODUCT_DATA", label: "Product Data" },
  { value: "SAMPLE", label: "Sample" },
  { value: "CERTIFICATE", label: "Certificate" },
  { value: "TEST_REPORT", label: "Test Report" },
  { value: "WARRANTY", label: "Warranty" },
  { value: "OTHER", label: "Other" },
];

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
      <SelectTrigger className="w-full sm:w-[160px] bg-muted/40 border-transparent">
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

export function SubmittalFiltersBar({
  status,
  submittalType,
  discipline,
  search,
  onStatusChange,
  onSubmittalTypeChange,
  onDisciplineChange,
  onSearchChange,
}: {
  status?: string;
  submittalType?: string;
  discipline?: string;
  search: string;
  onStatusChange: (v?: string) => void;
  onSubmittalTypeChange: (v?: string) => void;
  onDisciplineChange: (v?: string) => void;
  onSearchChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex flex-wrap gap-2 flex-1">
        <FilterSelect placeholder="All Status" options={STATUSES} value={status} onChange={onStatusChange} />
        <FilterSelect placeholder="All Types" options={TYPES} value={submittalType} onChange={onSubmittalTypeChange} />
        <FilterSelect placeholder="All Disciplines" options={DISCIPLINES} value={discipline} onChange={onDisciplineChange} />
      </div>

      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search submittals"
          className="pl-9 bg-muted/40 border-transparent"
        />
      </div>
    </div>
  );
}
